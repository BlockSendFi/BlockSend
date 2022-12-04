import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddContactInput } from '../inputs/add-contact.input';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from 'src/schemas/user.schema';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyContacts(@CurrentUser() user: User) {
    const contacts = await this.contactService.getMyContacts(user);
    return contacts;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async addContact(
    @Body() addContactInput: AddContactInput,
    @CurrentUser() user: User,
  ) {
    const contact = await this.contactService.createContact(
      addContactInput,
      user,
    );
    return contact;
  }
}
