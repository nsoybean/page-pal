import { ValidationPipe } from './validation.pipe';
import {
  Controller,
  Get,
  Res,
  HttpStatus,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SavesService } from './saves.service';
import { AuthGuard } from '@nestjs/passport';
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
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Res() response) {
    const { data: results, error } = await Common.pWrap(
      this.saveService.findAll(),
    );

    if (error) {
      console.log(`[SavesCon][findAll] Error: ${error.message}`);
      return HttpResponse.writeErrorResponse(error);
    }

    const findAllResults = {
      total_records: results.total_records,
      data: plainToInstance(GetSaveResponseDto, results.data),
    };

    return response.status(HttpStatus.OK).json(findAllResults);
  }

  @Get(':id')
  async findOne(@Res() response, @Param('id') id: string) {
    const { data, error } = await Common.pWrap(this.saveService.findOne(id));

    if (error) {
      console.log(`[SavesCon][findOne] Error: ${error.message}`);
      return HttpResponse.writeErrorResponse(error);
    }

    const save = plainToInstance(GetSaveResponseDto, data);
    return response.status(HttpStatus.OK).json(save);
  }

  @Delete(':id')
  async deleteOne(@Res() response, @Param('id') id: string) {
    const { data, error } = await Common.pWrap(this.saveService.DeleteOne(id));

    if (error) {
      console.log(`[SavesCon][findOne] Error: ${error.message}`);
      return HttpResponse.writeErrorResponse(error);
    }

    const save = plainToInstance(GetSaveResponseDto, data);
    return response.status(HttpStatus.OK).json(save);
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
