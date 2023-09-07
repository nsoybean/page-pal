import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
  Logger,
  Injectable,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { config } from 'dotenv';
import { AuthService } from './auth.service';
import { NodeEnv } from './../library/common';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

config();
@Controller('login')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  // authentication using 'google' strategy from the passport module
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth(@Request() req) {}

  // callback Google calls after authentication
  @Get('redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const loginRes = await this.authService.googleLogin(req.user);

    let clientRedirectUrl = '';
    if (process.env.NODE_ENV === NodeEnv.DEVELOPMENT) {
      this.logger.debug(`env: ${process.env.LOCAL_CLIENT_URL}`);
      clientRedirectUrl = process.env.LOCAL_CLIENT_URL;
    } else {
      this.logger.debug(`env: ${process.env.STAGING_CLIENT_URL}`);
      clientRedirectUrl = process.env.STAGING_CLIENT_URL;
    }

    // redirect to client url and set token in url
    res.redirect(
      302,
      `${clientRedirectUrl}#access_token=${
        loginRes.access_token
      }&expires_in=${28800}&token_type=bearer&email=${loginRes.email}&picture=${
        loginRes.picture
      }`,
    );
  }
}
