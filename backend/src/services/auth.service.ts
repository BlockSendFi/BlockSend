import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/schemas/user.schema';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserService') private readonly usersService: UserService,
    private jwtService: JwtService,
  ) { }

  private async encryptPassword(password) {
    const passwordEncrypted = await bcrypt.hash(password, SALT_ROUNDS);
    return passwordEncrypted;
  }

  private getAuthPayloadForUser(user: User) {
    const payload = { email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    const passwordEncrypted = await this.encryptPassword(password);
    if (user && user.password === passwordEncrypted) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    return this.getAuthPayloadForUser(user);
  }

  async signup(signupInput) {
    const passwordEncrypted = await this.encryptPassword(signupInput.password);
    const params = {
      ...signupInput,
      password: passwordEncrypted,
    };
    const user = await this.usersService.createUser(params);
    return this.getAuthPayloadForUser(user);
  }
}
