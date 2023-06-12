import { Controller, Get, Req, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { SavesService } from './saves.service';
import { Save } from './schemas/save.schema';

@Controller('saves')
export class SavesController {
  constructor(private readonly saveService: SavesService) {}

  @Get()
  // @HttpCode(200) // uncomment to overwrite
  async findAll(): Promise<Save[]> {
    const data = await this.saveService.findAll();
    return data;
  }
}
