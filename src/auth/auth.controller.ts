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
    if (process.env.NODE_ENV === NodeEnv.DEVELOPMENT) {
      res.redirect(
        `http://localhost:3002/saves?access_token=${loginRes.access_token}`,
      );
      return res.status(HttpStatus.ACCEPTED).json(loginRes.access_token);
    } else {
      res.redirect(
        `https://stg-page-pal-ux.vercel.app/saves?access_token=${loginRes.access_token}`,
      );
    }
  }
}
