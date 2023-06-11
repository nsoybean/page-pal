import { Controller, Get, Req, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // @HttpCode(200) // uncomment to overwrite
  getHello(@Req() request: Request): string {
    return this.appService.getHello();
  }
}
