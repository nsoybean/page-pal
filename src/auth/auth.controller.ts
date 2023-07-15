import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { config } from 'dotenv';
import { AuthService } from './auth.service';
import { NodeEnv } from './../library/common';
config();
@Controller('google')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // authentication using 'google' strategy from the passport module
  @Get()
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth(@Req() req) {}

  // auth redirect
  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const loginRes = await this.authService.googleLogin(req.user);

    // redirect client request and set token as query param
    res.cookie('access_token', loginRes.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * Number(process.env.JWT_SECRET_EXPIRY_SECONDS),
    });

    switch (process.env.NODE_ENV) {
      case NodeEnv.DEVELOPMENT:
        console.log('🚀 redirect dev env:', process.env.LOCAL_CLIENT_URL);
        res.redirect(`${process.env.LOCAL_CLIENT_URL}`);
      default:
        console.log('🚀 redirect default env:', process.env.STAGING_CLIENT_URL);
        res.redirect(`${process.env.STAGING_CLIENT_URL}`);
        break;
    }
  }
}
