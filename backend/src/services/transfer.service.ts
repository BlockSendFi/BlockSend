import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
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
import { UserService } from './user.service';

@Injectable()
export class TransferService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TransferService.name);

  private provider;
  private signer;
  private EUReContract;
  private BlockSendContract;

  constructor(
    @InjectModel(Transfer.name) private transferModel: Model<TransferDocument>,
    @Inject('ContactService') private contactService: ContactService,
    @Inject('UserService') private userService: UserService,
  ) {
    const networkUrl = `${process.env.ALCHEMY_NETWORK_ENDPOINT}${process.env.ALCHEMY_API_KEY}`;
    this.provider = new ethers.providers.JsonRpcProvider(networkUrl);

    this.EUReContract = new ethers.Contract(
      process.env.MONERIUM_EURE_ADDRESS,
      ERC20ABI.abi,
      this.provider,
    );

    this.signer = new ethers.Wallet(
      process.env.SIGNER_PRIVATE_KEY,
      this.provider,
    );

    this.BlockSendContract = new ethers.Contract(
      process.env.BLOCKSEND_ADDRESS,
      BlockSendABI.abi,
      this.signer,
    );
  }

  private async onTransferInitialized(transferId, amount) {
    this.logger.info(
      `Transfer ${transferId} with amount ${amount} initialized`,
    );

    await this.transferModel
      .findByIdAndUpdate(transferId, {
        $set: {
          status: TransferStatus.STARTED,
        },
      })
      .exec();
  }

  private onTransferStatusChanged(transferId, status, error) {
    this.logger.info(
      `Transfer ${transferId} changed status to ${status} (Error : ${error})`,
    );
  }

  private onTransferFinalized(transferId, amountWithoutFees) {
    this.logger.info(
      `Transfer ${transferId} finalized (amountWithoutFees: ${amountWithoutFees})`,
    );

    this.setTransferOnChainCompleted(transferId, amountWithoutFees);
  }

  private listenEvents() {
    this.BlockSendContract.on('TransferInitilized', this.onTransferInitialized);
    this.BlockSendContract.on(
      'TransferStatusChanged',
      this.onTransferStatusChanged,
    );
    this.BlockSendContract.on('TransferFinalized', this.onTransferFinalized);
  }

  onApplicationBootstrap() {
    this.logger.info(`(TransferService) The module has been initialized.`);

    this.listenEvents();
  }

  async initTransfer(initTransferInput, user) {
    const contact = await this.contactService.getContact(
      initTransferInput.contact,
    );

    if (!contact.user.equals(user._id)) {
      throw new UnauthorizedException('Contact does not belong to user');
    }

    const transfer = await new this.transferModel({
      user: user._id,
      userWalletAddress: initTransferInput.walletAddress,
      amount: initTransferInput.amount,
      recipient: _.pick(contact, 'firstName', 'lastName', 'phoneNumber'),
    }).save();

    await this.checkBalanceAndStartTransfer(transfer);

    return this.transferModel.findById(transfer._id);
  }

  async getMyTransfers(user) {
    return this.transferModel.find({ user: user._id }).lean();
  }

  private async startTransfer(transfer: Transfer) {
    this.logger.info(`Starting transfer ${transfer._id} now !`);
    await this.transferModel
      .findByIdAndUpdate(transfer._id, {
        $set: { status: TransferStatus.STARTING },
      })
      .exec();
    const amountDecimals = ethers.utils.parseUnits(
      transfer.amount.toString(),
      18,
    );
    try {
      const tx = await this.BlockSendContract.initializeTransfer(
        transfer._id,
        transfer.userWalletAddress,
        amountDecimals,
      );

      await this.transferModel
        .findByIdAndUpdate(transfer._id, {
          $set: { offchainTransferTx: tx.address },
        })
        .exec();
      console.log(`setting offchainTransferTx in transfer ${transfer._id}`);
    } catch (error) {
      this.logger.info(`Transfer ${transfer._id} failed : « ${error.reason} »`);
      await this.transferModel
        .findByIdAndUpdate(transfer._id, {
          $set: { status: TransferStatus.FAILED },
        })
        .exec();
    }
  }

  private async notifyOffchainProvider(transfer) {
    const user = await this.userService.getUser(transfer.user);
    const offchainProviderParams = {
      mode: 'live',
      amount: transfer.amountWithoutFees,
      transferTx: transfer.offchainTransferTx,
      destination: transfer.recipient,
      origin: {
        firstName: user.firstName,
        lastName: user.lastName,
        country: 'FR',
      },
    };

    console.log('notify offchain provider with', offchainProviderParams);

    try {
      const response = await axios.post(
        process.env.OFFCHAIN_PROVIDER_URL,
        offchainProviderParams,
        {
          headers: {
            Authorization: `Bearer ${process.env.OFFCHAIN_PROVIDER_SECRET}`,
          },
        },
      );
      await this.transferModel
        .findOneAndUpdate(transfer._id, {
          $set: {
            status: TransferStatus.OFFRAMP_INIT,
            offchainProviderTrackingId: response.data.trackingId,
          },
        })
        .exec();
    } catch (error) {
      this.logger.info(
        `Failed to notify offchain provider for transfer ${transfer._id}`,
      );
    }
  }

  async setTransferOnChainCompleted(transferId, amountWithoutFees) {
    const transfer = await this.transferModel.findById(transferId);
    if (transfer.status === TransferStatus.OFFRAMP_COMPLETED) {
      return;
    }

    await this.transferModel
      .findByIdAndUpdate(transferId, {
        $set: {
          amountWithoutFees,
          status: TransferStatus.ONCHAIN_TRANSFER_DONE,
        },
      })
      .exec();

    this.notifyOffchainProvider({
      ...transfer,
      amountWithoutFees,
      status: TransferStatus.ONCHAIN_TRANSFER_DONE,
    });

    return await this.transferModel.findById(transferId);
  }

  private async checkBalanceAndStartTransfer(transfer: Transfer) {
    const balance = await this.EUReContract.balanceOf(
      transfer.userWalletAddress,
    );

    const balanceInt = parseInt(ethers.utils.formatEther(balance));
    this.logger.info(
      `[CRON] User wallet ${transfer.userWalletAddress} has a balance of ${balanceInt} EURe / ${transfer.amount} EURe`,
    );

    if (balanceInt >= transfer.amount) {
      await this.startTransfer(transfer);
    }
  }

  @Cron('* * * * *')
  async checkPendingTransfers() {
    this.logger.info('[CRON] Checking pending transfers');

    const pendingTransfers = await this.transferModel
      .find({ status: TransferStatus.PENDING })
      .lean();

    for (const transfer of pendingTransfers) {
      await this.checkBalanceAndStartTransfer(transfer);
    }
  }
}
