import { Model } from 'mongoose';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Common } from 'src/library';
import { IGoogleLogin, IUserDetails } from './interface';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Look up user in database, insert if not found, return jwt token
   * @param user user object returned by google auth provider
   * @returns jwt token
   */
  async googleLogin(user: IUserDetails): Promise<IGoogleLogin> {
    // return if unauthn
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    // look up user (email as identifier)
    const { data: userDetails, error: findUserErr } = await Common.pWrap(
      this.findUserByEmail(user.email),
    );
    if (findUserErr) {
      throw findUserErr;
    }

    // if user found, sign user details and return token
    if (userDetails) {
      const payload = {
        sub: userDetails.uuid,
        email: userDetails.email,
      };

      const { data: jwtToken, error: generateJwtErr } = await Common.pWrap(
        this.generateJwt(payload),
      );
      if (generateJwtErr) {
        throw generateJwtErr;
      }

      return {
        email: userDetails.email,
        access_token: jwtToken,
      };
    } else {
      // if user not found, register user, sign user details and return token
      const { data: jwtToken, error: registerErr } = await Common.pWrap(
        this.registerUser(user),
      );
      if (registerErr) {
        throw registerErr;
      }

      return {
        email: userDetails.email,
        access_token: jwtToken,
      };
    }
  }

  /**
   *
   * @param user user details
   * @returns jwt token of new user
   */
  async registerUser(user: IUserDetails): Promise<string> {
    try {
      const newUser = new this.userModel(user);
      newUser.uuid = uuidv4();
      const { error: saveErr } = await Common.pWrap(newUser.save());
      if (saveErr) {
        throw saveErr;
      }

      const payload = {
        sub: newUser.uuid,
        email: newUser.email,
      };

      return this.generateJwt(payload);
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    const user = this.userModel.findOne({ email: email });
    return user;
  }

  /**
   *
   * @param payload any
   * @returns jwt token of payload
   */
  async generateJwt(payload: any): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }
}
