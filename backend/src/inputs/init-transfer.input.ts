import { IsEthereumAddress, IsMongoId, IsNumber, Min } from 'class-validator';

export class InitTransferInput {
  @IsMongoId()
  public contact: string;

  @IsNumber()
  @Min(0.5)
  public amount: number;

  @IsEthereumAddress()
  public walletAddress: number;
}
