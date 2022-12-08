import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email });
  }

  async createUser(signupInput): Promise<User | undefined> {
    return new this.userModel(signupInput).save();
  }

  async getUser(userId): Promise<User | undefined> {
    console.log(
      '🚀 ~ file: user.service.ts:19 ~ UserService ~ getUser ~ userId',
      userId,
    );
    return this.userModel.findById(userId).lean();
  }
}
