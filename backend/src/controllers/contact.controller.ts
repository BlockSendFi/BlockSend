import { Controller, Post } from '@nestjs/common';
import { ContactService } from '../services/contact.service';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async addContact() {
    await this.contactService.createContact({
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      addedBy: '5f9e1b9b9b9b9b9b9b9b9b9b',
    });

    return {
      success: true,
    };
  }
}
