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

    let clientRedirectUrl = '';
    let cookieDomain = '';
    if (process.env.NODE_ENV === NodeEnv.DEVELOPMENT) {
      console.log('🚀 redirect to DEV env:', process.env.LOCAL_CLIENT_URL);
      clientRedirectUrl = process.env.LOCAL_CLIENT_URL;
    } else {
      console.log(
        '🚀 redirect to DEFAULT env:',
        process.env.STAGING_CLIENT_URL,
      );
      cookieDomain = process.env.COOKIE_DOMAIN;
      clientRedirectUrl = process.env.STAGING_CLIENT_URL;
    }

    //  set token as cookie and redirect to client url
    res.cookie('access_token', loginRes.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      domain: cookieDomain,
      maxAge: 1000 * Number(process.env.JWT_SECRET_EXPIRY_SECONDS),
    });
    res.redirect(clientRedirectUrl);
  }
}
