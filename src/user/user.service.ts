import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { IUser } from './interfaces/user.interface';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<IUser>) {}

  async findUserByEmail(email: string): Promise<IUser> {
    return this.userModel.findOne({ email: email });
  }

  async findUserById(id: string): Promise<IUser> {
    return this.userModel.findOne({ id: id });
  }

  async registerNewUser(userDetails: any): Promise<IUser> {
    const newUser = new this.userModel(userDetails);
    newUser.id = uuidv4();
    return newUser.save();
  }

  async updateLastSignIn(email: string): Promise<IUser> {
    const user = this.userModel.findOneAndUpdate(
      { email: email },
      { lastSignIn: new Date() },
    );
    return user;
  }
}
