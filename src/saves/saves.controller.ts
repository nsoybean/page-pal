import { Controller, Get, Res, HttpStatus, Post, Body } from '@nestjs/common';
import { SavesService } from './saves.service';
import { CreateSaveRequestDto } from './dto/save.dto';
import { Save } from './schemas/save.schema';
import { Common } from 'src/library';

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
  async createSave(
    @Res() response,
    @Body() createSaveDto: CreateSaveRequestDto,
  ) {
    // TODO @shawbin: consider converting dto into entity before passing to service layer
    const { data, error } = await Common.pWrap(
      this.saveService.create(createSaveDto),
    );

    if (error) {
      return response.status(HttpStatus.BAD_REQUEST).json('error');
    }

    return response.status(HttpStatus.CREATED).json(data);
  }
}
