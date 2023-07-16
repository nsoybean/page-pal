import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Common } from 'src/library';
import { UserService } from 'src/user/user.service';

import { IGoogleLogin, IUserDetails } from './interface';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService, // @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(UserService)
    private readonly userService: UserService,
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
      this.userService.findUserByEmail(user.email),
    );
    if (findUserErr) {
      throw findUserErr;
    }

    // if user found, sign user details and return token
    if (userDetails) {
      const payload = {
        sub: userDetails.id,
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
        picture: user.picture,
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
        picture: user.picture,
      };
    }
  }

  /**
   *
   * @param user user details
   * @returns jwt token of new user
   */
  async registerUser(userDetails: IUserDetails): Promise<string> {
    try {
      const newUser = await this.userService.registerNewUser(userDetails);

      const payload = {
        sub: newUser.id,
        email: newUser.email,
      };

      return this.generateJwt(payload);
    } catch {
      throw new InternalServerErrorException();
    }
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
