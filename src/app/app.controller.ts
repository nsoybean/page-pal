import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  getHello(): any {
    const response = {
      health: 'ok',
      version: process.env.npm_package_version,
    };

    return response;
  }
}
