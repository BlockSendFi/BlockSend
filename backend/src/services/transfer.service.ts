import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer, TransferDocument } from '../schemas/transfer.schema';
import { ContactService } from './contact.service';
import * as _ from 'underscore';
import { TransferStatus } from 'src/enums/transfer-status.enum';
import axios from 'axios';
import { ethers } from 'ethers';
import { Cron } from '@nestjs/schedule';
import { Logger } from 'ethers/lib/utils';
import ERC20ABI from '../contracts/ERC20.json';
import BlockSendABI from '../contracts/Transfer.json';

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(
    @InjectModel(Transfer.name) private transferModel: Model<TransferDocument>,
    @Inject('ContactService') private contactService: ContactService,
  ) {}

  async initTransfer(initTransferInput, user) {
    const contact = await this.contactService.getContact(
      initTransferInput.contact,
    );

    if (!contact.user.equals(user._id)) {
      throw new UnauthorizedException('Contact does not belong to user');
    }

    return new this.transferModel({
      user: user._id,
      userWalletAddress: initTransferInput.walletAddress,
      amount: initTransferInput.amount,
      recipient: _.pick(contact, 'firstName', 'lastName', 'phoneNumber'),
    }).save();
  }

  async getMyTransfers(user) {
    return this.transferModel.find({ user: user._id }).lean();
  }

  async transferDone(transferId) {
    const transfer = await this.transferModel.findById(transferId);

    if (transfer.status === TransferStatus.DONE) {
      return;
    }

    const hub2Params = {
      transferTx:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      amount: 200,
      account: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+123456789',
      },
      recipient: transfer.recipient,
    };

    await axios.post(process.env.HUB2_URL, hub2Params, {
      headers: {
        Authorization: `Bearer ${process.env.HUB2_TOKEN}`,
      },
    });

    await this.transferModel.findByIdAndUpdate(transferId, {
      $set: { status: TransferStatus.DONE },
    });

    return await this.transferModel.findById(transferId);
  }

  @Cron('* * * * *')
  async checkPendingTransfers() {
    this.logger.info('[CRON] Checking pending transfers');
    const networkUrl = `${process.env.INFURA_NETWORK_ENDPOINT}${process.env.INFURA_API_KEY}`;
    const provider = new ethers.providers.JsonRpcProvider(networkUrl);

    const EUReContract = new ethers.Contract(
      process.env.MONERIUM_EURE_ADDRESS,
      ERC20ABI.abi,
      provider,
    );
    const BlockSendContract = new ethers.Contract(
      process.env.BLOCKSEND_ADDRESS,
      BlockSendABI.abi,
      provider,
    );

    const pendingTransfers = await this.transferModel
      .find({ status: TransferStatus.INITIALIZED })
      .lean();

    for (const transfer of pendingTransfers) {
      const balance = await EUReContract.balanceOf(transfer.userWalletAddress);

      const balanceInt = parseInt(ethers.utils.formatEther(balance));
      this.logger.info(
        `[CRON] wallet ${transfer.userWalletAddress} | balance ${balanceInt} | amount required ${transfer.amount}`,
      );

      if (balanceInt >= transfer.amount) {
        const amountDecimals = ethers.utils.parseUnits(
          transfer.amount.toString(),
          18,
        );
        await BlockSendContract.initializeTransfer(
          transfer._id,
          // add user wallet address here (transfer.userWalletAddress)
          amountDecimals,
        );
      }
    }
  }
}
