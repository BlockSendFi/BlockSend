import { IsMongoId, IsNumber } from 'class-validator';

export class InitTransferInput {
  @IsMongoId()
  public contact: string;

  @IsNumber()
  public amount: number;
}
