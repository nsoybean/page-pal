import { Controller, Get, Res, HttpStatus, Post, Body } from '@nestjs/common';
import { SavesService } from './saves.service';
import { CreateSaveDto } from './dto/save.dto';
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

  @Post()
  async createSave(@Res() response, @Body() createSaveDto: CreateSaveDto) {
    console.log(
      '🚀 ~ file: saves.controller.ts:19 ~ SavesController ~ createSave ~ createSaveDto:',
      createSaveDto,
    );
    return response
      .status(HttpStatus.CREATED)
      .json({ message: 'mock created!' });
  }
}
