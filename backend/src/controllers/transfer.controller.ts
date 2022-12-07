import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from 'src/schemas/user.schema';
import { InitTransferInput } from 'src/inputs/init-transfer.input';
import { TransferService } from 'src/services/transfer.service';
import { OffchainProviderEventInput } from 'src/inputs/offchain-provider-event-input.input';

@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) { }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getMyTransfers(@CurrentUser() user: User) {
    const transfers = await this.transferService.getMyTransfers(user);
    return transfers;
  }

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

  @Post('/notify')
  async offchainProviderTransferEvent(
    @Body() offchainProviderEventInput: OffchainProviderEventInput,
  ) {
    await this.transferService.handleOffchainProviderTransferEvent(
      offchainProviderEventInput,
    );
    return {
      success: true,
    };
  }
}
