import { Controller, Get, Req, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { SavesService } from './saves.service';
import { Save } from './interfaces/save.interface';

@Controller('saves')
export class SavesController {
  constructor(private readonly saveService: SavesService) {}

  @Get()
  // @HttpCode(200) // uncomment to overwrite
  getHello(@Req() request: Request): Save[] {
    return this.saveService.get();
  }
}
