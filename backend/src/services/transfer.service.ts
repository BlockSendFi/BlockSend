import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer, TransferDocument } from '../schemas/transfer.schema';
import { ContactService } from './contact.service';
import * as _ from 'underscore';
import { TransferStatus } from 'src/enums/transfer-status.enum';
import axios from 'axios';

@Injectable()
export class TransferService {
  constructor(
    @InjectModel(Transfer.name) private transferModel: Model<TransferDocument>,
    @Inject('ContactService') private contactService: ContactService,
  ) { }

  async initTransfer(initTransferInput, user) {
    const contact = await this.contactService.getContact(
      initTransferInput.contact,
    );

    if (!contact.user.equals(user._id)) {
      throw new UnauthorizedException('Contact does not belong to user');
    }

    return new this.transferModel({
      user: user._id,
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
}
