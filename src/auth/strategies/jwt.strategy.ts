import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { config } from 'dotenv';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

import { IJwtPayload } from '../interface/index';

config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
  ) {
    const extractJwtFromCookie = (req: Request) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies['access_token'];
      }
      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };

    super({
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: extractJwtFromCookie,
    });
  }

  async validate(payload: IJwtPayload) {
    // call user service to check if user exist
    const user = await this.userService.findUserById(payload.sub);

    if (!user) throw new UnauthorizedException('Please log in to continue');

    // set the user for the current asynchronous context
    // Whatever gets returned here gets attached to the req object as `req.user`
    return user;
  }
}
