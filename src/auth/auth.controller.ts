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
    if (process.env.NODE_ENV === NodeEnv.DEVELOPMENT) {
      console.log('🚀 DEV env:', process.env.LOCAL_CLIENT_URL);
      clientRedirectUrl = process.env.LOCAL_CLIENT_URL;
    } else {
      console.log('🚀 DEFAULT env:', process.env.STAGING_CLIENT_URL);
      clientRedirectUrl = process.env.STAGING_CLIENT_URL;
    }

    // redirect to client url and set token in url
    res.redirect(
      `${clientRedirectUrl}#access_token=${
        loginRes.access_token
      }&expires_in=${28800}&token_type=bearer&email=${loginRes.email}&picture=${
        loginRes.picture
      }`,
    );
  }
}
