import { ValidationPipe } from './validation.pipe';
import { Controller, Get, Res, HttpStatus, Post, Body } from '@nestjs/common';
import { SavesService } from './saves.service';
import {
  CreateSaveRequestDto,
  CreateSaveResponseDto,
  GetSaveResponseDto,
} from './dto/save.dto';
import { HttpResponse, Common } from '../library';
import { plainToInstance } from 'class-transformer';

@Controller('saves')
export class SavesController {
  constructor(private readonly saveService: SavesService) {}

  @Get()
  async findAll(@Res() response) {
    const data = await this.saveService.findAll();

    const findSaves = plainToInstance(GetSaveResponseDto, data);
    return response.status(HttpStatus.OK).json(findSaves);
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
      console.log(`[SavesCon][createSave] Error: ${error.message}`);
      return HttpResponse.writeErrorResponse(error);
    }

    const createSaveResponse = plainToInstance(CreateSaveResponseDto, data);

    return response.status(HttpStatus.CREATED).json(createSaveResponse);
  }
}
