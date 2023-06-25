import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // @HttpCode(200) // uncomment to overwrite
  getHello(): string {
    return this.appService.getHello();
  }
}
