import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from 'src/schemas/user.schema';
import { InitTransferInput } from 'src/inputs/init-transfer.input';
import { TransferService } from 'src/services/transfer.service';

@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) { }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async initTransfer(
    @Body() initTransferInput: InitTransferInput,
    @CurrentUser() user: User,
  ) {
    const transfer = await this.transferService.initTransfer(
      initTransferInput,
      user,
    );
    return transfer;
  }
}
