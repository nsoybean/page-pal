import { Model } from 'mongoose';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Common, AppError } from 'src/library';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   *
   * @param payload any
   * @returns string
   */
  generateJwt(payload) {
    return this.jwtService.sign(payload);
  }

  /**
   * Look up user in database, insert if not found, return jwt token
   * @param user user object returned by google auth provider
   * @returns jwt token
   */
  async googleLogin(user): Promise<string> {
    // return if unauthn
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    // look up user
    const { data: userDetails, error: findUserErr } = await Common.pWrap(
      this.findUserByEmail(user.email),
    );
    if (findUserErr) {
      return findUserErr;
    }

    // if user found, sign user details and return token
    // if user not found, register user, sign user details and return token
    let jwtToken = '';
    if (userDetails) {
      jwtToken = this.generateJwt({
        sub: userDetails.id,
        email: userDetails.email,
      });
    } else {
      jwtToken = this.registerUser(user);
    }
    return jwtToken;
  }

  /**
   *
   * @param user
   * @returns user details of new user
   */
  async registerUser(user: RegisterUserDto) {
    try {
      const newUser = this.userRepository.create(user);
      newUser.username = generateFromEmail(user.email, 5);

      await this.userRepository.save(newUser);

      return this.generateJwt({
        sub: newUser.id,
        email: newUser.email,
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findUserByEmail(email) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
