import { ValidationPipe } from './validation.pipe';
import { Controller, Get, Res, HttpStatus, Post, Body } from '@nestjs/common';
import { SavesService } from './saves.service';
import { CreateSaveRequestDto } from './dto/save.dto';
import { Save } from './schemas/save.schema';
import { Common } from 'src/library';
import { AppError } from 'src/library';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { Save as ISaveInterface } from './interfaces/save.interface';

@Controller('saves')
export class SavesController {
  constructor(private readonly saveService: SavesService) {}

  @Get()
  async findAll(@Res() response) {
    const data = await this.saveService.findAll();
    return response.status(HttpStatus.OK).json(data);
  }

  @Post()
  async createSave(
    @Res() response,
    @Body(new ValidationPipe()) createSaveDto: CreateSaveRequestDto,
  ) {
    const { data, error } = await Common.pWrap(
      this.saveService.create(createSaveDto),
    );

    if (error) {
      return AppError.writeErrorResponse(response, error);
    }

    return response.status(HttpStatus.CREATED).json(data);
  }
}
