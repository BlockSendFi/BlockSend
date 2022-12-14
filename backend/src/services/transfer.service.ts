import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer, TransferDocument } from '../schemas/transfer.schema';
import { ContactService } from './contact.service';
import * as _ from 'underscore';
import { TransferStatus } from 'src/enums/transfer-status.enum';
import axios from 'axios';
import { BigNumber, ethers, utils } from 'ethers';
import ERC20 from '../../contracts/ERC20.json';
import BlockSendRouter from '../../contracts/BlockSendRouter.json';
import { UserService } from './user.service';
import { Cron } from '@nestjs/schedule';

interface IOptionsTx {
  gasPrice: BigNumber;
  gasLimit: BigNumber;
}

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
    const networkUrl =
      process.env.NODE_ENV === 'development'
        ? `${process.env.INFURA_NETWORK_ENDPOINT}${process.env.INFURA_API_KEY}`
        : `${process.env.ALCHEMY_NETWORK_ENDPOINT}${process.env.ALCHEMY_API_KEY}`;
    this.provider = new ethers.providers.JsonRpcProvider(networkUrl);

    this.EUReContract = new ethers.Contract(
      process.env.MONERIUM_EURE_ADDRESS,
      ERC20.abi,
      this.provider,
    );

    this.signer = new ethers.Wallet(
      process.env.SIGNER_PRIVATE_KEY,
      this.provider,
    );

    this.BlockSendContract = new ethers.Contract(
      process.env.BLOCKSEND_ROUTER_ADDRESS,
      BlockSendRouter.abi,
      this.signer,

      // { gasPrice: ethers.utils.parseUnits('100', 'gwei'), gasLimit: 1000000 },
    );
  }

  private async onTransferInitialized(transferIdentifier, amount) {
    this.logger.log(
      `Transfer ${transferIdentifier} with amount ${amount} initialized`,
    );

    await this.transferModel
      .updateOne(
        { identifier: transferIdentifier },
        {
          $set: {
            status: TransferStatus.STARTED,
          },
        },
      )
      .exec();
  }

  private onTransferFinalized(transferIdentifier, amountWithoutFees) {
    this.logger.log(
      `Transfer ${transferIdentifier} finalized (amountWithoutFees: ${amountWithoutFees})`,
    );

    this.setTransferOnChainCompleted(transferIdentifier, amountWithoutFees);
  }

  private listenEvents() {
    this.BlockSendContract.on(
      'TransferInitilized',
      this.onTransferInitialized.bind(this),
    );

    this.BlockSendContract.on(
      'TransferFinalized',
      this.onTransferFinalized.bind(this),
    );
  }

  onApplicationBootstrap() {
    this.logger.log(`(TransferService) The module has been initialized.`);

    this.listenEvents();
  }

  async initTransfer(initTransferInput, user) {
    const transfersCount = await this.transferModel.countDocuments();
    const transfer = await new this.transferModel({
      identifier: `t${transfersCount + 1}`,
      user: user._id,
      userWalletAddress: initTransferInput.walletAddress,
      amount: initTransferInput.amount,
      recipient: initTransferInput.recipient,
    }).save();

    await this.checkBalanceAndStartTransfer(transfer);

    return this.transferModel.findById(transfer._id);
  }

  async getMyTransfers(user) {
    return this.transferModel
      .find({ user: user._id }, null, { sort: { createdAt: -1 } })
      .lean();
  }

  async getTransfer(transferId) {
    return this.transferModel.findById(transferId).lean();
  }

  private async startTransfer(transfer: Transfer) {
    this.logger.log(`Starting transfer ${transfer._id} now !`);
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
      const optionsTx: IOptionsTx = {
        gasPrice:
          process.env.NODE_ENV === 'development'
            ? ethers.utils.parseUnits('50.0', 'gwei')
            : ethers.utils.parseUnits('140.0', 'gwei'),
        gasLimit: ethers.utils.parseUnits('0.008', 'gwei'),
      };

      const tx = await this.BlockSendContract.initializeTransfer(
        transfer.identifier,
        utils.getAddress(transfer.userWalletAddress),
        amountDecimals,
        optionsTx,
      );

      this.logger.log(tx);

      await this.transferModel
        .findByIdAndUpdate(transfer._id, {
          $set: {
            offchainTransferTx: tx.hash,
            routingOnChainStarted: true,
          },
        })
        .exec();
      this.logger.log(
        `Setting offchainTransferTx in transfer ${transfer._id} (${process.env.BLOCKCHAIN_EXPLORER}${tx.hash})`,
      );
    } catch (error) {
      console.error(error);
      this.logger.log(`Transfer ${transfer._id} failed : ?? ${error.reason} ??`);
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
      mode: process.env.NODE_ENV === 'development' ? 'sandbox' : 'live',
      amount: transfer.amountWithoutFees / 1000000,
      transferTx: transfer.offchainTransferTx,
      destination:
        process.env.NODE_ENV === 'development'
          ? { ...transfer.recipient, phoneNumber: '00000001' }
          : transfer.recipient,
      origin: {
        firstName: user.firstName,
        lastName: user.lastName,
        country: 'FR',
      },
    };

    this.logger.debug(
      `Notify offchain provider with ${JSON.stringify(offchainProviderParams)}`,
    );

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
            offchainProviderTrackingId: response.data.id,
            offchainTransferStarted: true,
          },
        })
        .exec();
    } catch (error) {
      this.logger.error(error);
      this.logger.log(
        `Failed to notify offchain provider for transfer ${transfer._id}`,
      );
    }
  }

  async setTransferOnChainCompleted(transferIdentifier, amountWithoutFees) {
    const transfer = await this.transferModel
      .findOne({ identifier: transferIdentifier })
      .lean();
    if (transfer.status === TransferStatus.OFFRAMP_COMPLETED) {
      return;
    }

    await this.transferModel
      .updateOne(
        { identifier: transferIdentifier },
        {
          $set: {
            amountWithoutFees: amountWithoutFees.toNumber(),
            status: TransferStatus.ONCHAIN_TRANSFER_DONE,
            routingOnChainCompleted: true,
          },
        },
      )
      .exec();

    const transferUpdated = await this.transferModel
      .findOne({ identifier: transferIdentifier })
      .lean();

    this.notifyOffchainProvider(transferUpdated);

    return await this.transferModel.findOne({ identifier: transferIdentifier });
  }

  private async checkBalanceAndStartTransfer(transfer: Transfer) {
    this.logger.debug(
      `Checking EURe balance for wallet ${transfer.userWalletAddress}`,
    );
    const balance = await this.EUReContract.balanceOf(
      transfer.userWalletAddress,
    );

    const balanceInt = parseFloat(ethers.utils.formatEther(balance));
    this.logger.log(
      `[CRON] User wallet ${transfer.userWalletAddress} has a balance of ${balanceInt} EURe / ${transfer.amount} EURe`,
    );

    if (balanceInt >= transfer.amount) {
      await this.startTransfer(transfer);
    }
  }

  @Cron(process.env.CHECK_PENDING_TRANSFER_CRON || '* * * * *')
  async checkPendingTransfers() {
    this.logger.log('[CRON] Checking pending transfers');

    const pendingTransfers = await this.transferModel
      .find({ status: TransferStatus.PENDING })
      .lean();

    for (const transfer of pendingTransfers) {
      await this.checkBalanceAndStartTransfer(transfer);
    }
  }

  async handleOffchainProviderTransferEvent(offchainProviderTransferEvent) {
    /*
      WRAPPER_RECEIVED = 'wrapper.received',
      WRAPPER_CHECKING = 'wrapper.checking',
      WRAPPER_CHECK_FAILED = 'wrapper.check.failed',
      WRAPPER_CHECK_SUCCESS = 'wrapper.check.success',
      API_CREATED = 'api.created',
      API_PENDING = 'api.pending',
      API_SUCCESS = 'api.success',
      API_FAILED = 'api.failed',
    */

    const transfer = await this.transferModel
      .findOne({
        offchainProviderTrackingId: offchainProviderTransferEvent.id,
      })
      .lean();

    if (!transfer) {
      this.logger.log(
        `No transfer found for offchain provider transfer id ${offchainProviderTransferEvent.id}`,
      );
      return;
    }

    if (offchainProviderTransferEvent.type === 'api.success') {
      this.logger.log(`Transfer ${transfer._id} completed !`);
      await this.transferModel
        .findByIdAndUpdate(transfer._id, {
          $set: {
            status: TransferStatus.OFFRAMP_COMPLETED,
            offchainTransferCompleted: true,
          },
        })
        .exec();
    } else if (
      offchainProviderTransferEvent.type === 'api.failed' ||
      offchainProviderTransferEvent.type === 'wrapper.check.failed'
    ) {
      this.logger.error(
        `Transfer ${transfer._id} failed ! Reason : ${offchainProviderTransferEvent.type}`,
      );
      await this.transferModel
        .findByIdAndUpdate(transfer._id, {
          $set: { status: TransferStatus.FAILED },
        })
        .exec();
    }
  }
}
