import { Controller, Get, Res, HttpStatus, Post } from '@nestjs/common';
import { SavesService } from './saves.service';
import { Save } from './schemas/save.schema';

@Controller('saves')
export class SavesController {
  constructor(private readonly saveService: SavesService) {}

  @Get()
  // @HttpCode(200) // uncomment to overwrite
  async findAll(@Res() response): Promise<Save[]> {
    const data = await this.saveService.findAll();
    return response.status(HttpStatus.OK).json(data);
  }

  // @Post()
  // async createSave(@Re)
}
