import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @UseGuards(LocalAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get()
  async getContact() {
    return {
      success: true,
    };
  }
}
