import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { IUser } from './interfaces/user.interface';
import { User } from './schemas/user.schema';
import { ClsService } from 'nestjs-cls';
import { IUserDetails } from 'src/auth/interface';

@Injectable()
export class UserService {
  constructor(
    private readonly cls: ClsService,
    @InjectModel(User.name) private userModel: Model<IUser>,
  ) {}

  async findUserByEmail(email: string): Promise<IUser> {
    return this.userModel.findOne({ email: email });
  }

  async findUserById(id: string): Promise<IUser> {
    return this.userModel.findOne({ id: id }).lean();
  }

  async registerNewUser(userDetails: IUserDetails): Promise<IUser> {
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
  async findMe(): Promise<IUser> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user.id;
    const user = await this.findUserById(ctxUserId);

    return user;
  }
}
