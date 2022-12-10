import { IsEthereumAddress, IsNumber, Min } from 'class-validator';
import { Recipient } from 'src/schemas/transfer.schema';

export class InitTransferInput {
  public recipient: Recipient;

  @IsNumber()
  @Min(0.5)
  public amount: number;

  @IsEthereumAddress()
  public walletAddress: number;
}
