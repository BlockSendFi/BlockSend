import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from 'src/schemas/contact.schema';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) { }

  createContact(contactInput, user) {
    return new this.contactModel({ ...contactInput, user: user._id }).save();
  }

  getMyContacts(user) {
    return this.contactModel.find({ user: user._id }).lean();
  }

  getContact(contactId) {
    return this.contactModel.findById(contactId).lean();
  }
}
