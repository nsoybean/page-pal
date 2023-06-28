import { GetBookmarkResponseDto } from './dto/get-bookmark.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BookmarkService } from './bookmark.service';
import {
  CreateBookmarkDto,
  CreateBookmarkResponseDto,
  ListBookmarkResponseDto,
  UpdateBookmarkDto,
} from './dto/index';

@Controller('bookmark')
@UseGuards(AuthGuard('jwt'))
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() createBookmarkDto: CreateBookmarkDto) {
    const newBookmark = await this.bookmarkService.create(createBookmarkDto);
    return CreateBookmarkResponseDto.convertToDto(newBookmark);
  }

  @Get()
  async findAll(
    @Query('page') page?: string, // optional
    @Query('limit') limit?: string, // optional
  ) {
    // TODO @sb: add validation to query param
    const listData = await this.bookmarkService.findAll(page, limit);
    return ListBookmarkResponseDto.convertToDto(listData);
  }

  @Get('/archive')
  async findAllArchive() {
    const listData = await this.bookmarkService.findAllArchive();
    return ListBookmarkResponseDto.convertToDto(listData);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const bookmark = await this.bookmarkService.findOne(id);
    return GetBookmarkResponseDto.convertToDto(bookmark);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.bookmarkService.archive(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
  ) {
    return this.bookmarkService.update(id, updateBookmarkDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const bookmark = await this.bookmarkService.remove(id);
    return GetBookmarkResponseDto.convertToDto(bookmark);
  }
}
