import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TagService } from './tag.service';
import { ListTagResponseDto } from './dto/get-tag.dto';

@Controller('tag')
@UseGuards(AuthGuard('jwt'))
export class TagController {
  constructor(private readonly TagService: TagService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create() {
    throw new Error('Not implemented');
  }

  @Get()
  async findAll(
    @Query('page') page?: string, // optional
    @Query('limit') limit?: string, // optional
  ) {
    // TODO @sb: add validation to query param
    const listData = await this.TagService.findAll(page, limit);
    return ListTagResponseDto.convertToDto(listData);
  }

  @Get('/autocomplete')
  async autocomplete(@Query('text') text?: string) {
    const tagList = await this.TagService.autocomplete(text);
    return tagList;
  }

  async getAllUserTags() {
    throw new Error('Not implemented');
  }

  async renameTag() {
    throw new Error('Not implemented');
  }

  async getBookmarkByTags() {
    throw new Error('Not implemented');
  }
}
