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
  UpdateBookmarkNoteDto,
  GetBookmarkByIdResponseDto,
} from './dto/index';
import { BookmarkStateEnum } from './interfaces/bookmark.interface';

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

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/v2')
  async createV2(@Body() createBookmarkDto: CreateBookmarkDto) {
    const newBookmark = await this.bookmarkService.createV2(createBookmarkDto);
    return CreateBookmarkResponseDto.convertToDto(newBookmark);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/v3')
  async createV3(@Body() createBookmarkDto: CreateBookmarkDto) {
    const newBookmark = await this.bookmarkService.createV3(createBookmarkDto);
    return CreateBookmarkResponseDto.convertToDto(newBookmark);
  }

  @Get()
  async findAll(
    @Query('page') page?: string, // optional
    @Query('limit') limit?: string, // optional
  ) {
    // TODO @sb: add validation to query param
    const listData = await this.bookmarkService.findAllWithState(
      page,
      limit,
      BookmarkStateEnum.AVAILABLE,
    );
    return ListBookmarkResponseDto.convertToDto(listData);
  }

  @Get('/archive')
  async findAllArchive(
    @Query('page') page?: string, // optional
    @Query('limit') limit?: string, // optional
  ) {
    const listData = await this.bookmarkService.findAllWithState(
      page,
      limit,
      BookmarkStateEnum.ARCHIVED,
    );
    return ListBookmarkResponseDto.convertToDto(listData);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const bookmark = await this.bookmarkService.findOne(id);
    return GetBookmarkByIdResponseDto.convertToDto(bookmark);
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string) {
    const bookmark = await this.bookmarkService.archive(id);
    return GetBookmarkResponseDto.convertToDto(bookmark);
  }

  @Patch(':id/unarchive')
  async unarchive(@Param('id') id: string) {
    const bookmark = await this.bookmarkService.unarchive(id);
    return GetBookmarkResponseDto.convertToDto(bookmark);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id/note')
  async updateNote(
    @Param('id') id: string,
    @Body() updateBookmarkNoteDto: UpdateBookmarkNoteDto,
  ) {
    const bookmark = await this.bookmarkService.updateNote(
      id,
      updateBookmarkNoteDto,
    );
    return GetBookmarkResponseDto.convertToDto(bookmark);
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
