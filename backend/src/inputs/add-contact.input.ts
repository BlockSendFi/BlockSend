import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class AddContactInput {
  @IsPhoneNumber()
  public phoneNumber: string;

  @IsNotEmpty()
  public firstName: string;

  @IsNotEmpty()
  public lastName: string;
}
