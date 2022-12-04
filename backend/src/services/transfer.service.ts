import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer, TransferDocument } from '../schemas/transfer.schema';
import { ContactService } from './contact.service';
import * as _ from 'underscore';

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
}
