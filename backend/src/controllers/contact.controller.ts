import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getContact() {
    return {
      success: true,
    };
  }
}
