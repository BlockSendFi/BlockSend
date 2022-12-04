import { IsEmail, Matches, MinLength, IsNotEmpty } from 'class-validator';
import validationRegex from 'src/constants/regex.constant';

export class SignupInput {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsNotEmpty()
  public firstName: string;

  @IsNotEmpty()
  public lastName: string;

  @MinLength(8)
  @IsNotEmpty()
  @Matches(validationRegex.PASSWORD_REGEX, { message: 'Password too weak' })
  public password: string;
}
