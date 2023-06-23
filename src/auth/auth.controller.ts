import { Common } from './../library/common';
import {
  Controller,
  HttpStatus,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'http';

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
    const { data, error } = await Common.pWrap(
      this.authService.googleLogin(req.user),
    );
    if (error) {
      return res.status(HttpStatus.UNAUTHORIZED);
    }

    res.cookie('access_token', data.access_token);

    return res.status(HttpStatus.OK).json(data);
  }
}
