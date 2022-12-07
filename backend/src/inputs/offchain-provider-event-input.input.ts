import { IsNotEmpty } from 'class-validator';

export class OffchainProviderEventInput {
  @IsNotEmpty()
  public id: string;

  @IsNotEmpty()
  public type: string;
}
