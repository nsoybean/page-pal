import { request } from 'http';

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

import { AuthService } from './auth.service';

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

    res.cookie('access_token', loginRes.access_token);

    return res.status(HttpStatus.OK).json(loginRes);
  }
}
