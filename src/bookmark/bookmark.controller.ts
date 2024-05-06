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
  Req,
  BadRequestException,
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
import {
  BookmarkStateEnum,
  ISearchArticle,
} from './interfaces/bookmark.interface';

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
    const newBookmark = await this.bookmarkService.createV3(
      createBookmarkDto.link.trim(),
    );
    return CreateBookmarkResponseDto.convertToDto(newBookmark);
  }

  @Get()
  async findAll(
    @Query('page') page?: string, // optional
    @Query('limit') limit?: string, // optional
    @Query('tag') tag?: string, // optional
  ) {
    // TODO @sb: add validation to query param
    const listData = await this.bookmarkService.findAllWithState(
      page,
      limit,
      BookmarkStateEnum.AVAILABLE,
      tag,
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

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   const bookmark = await this.bookmarkService.findOne(id);
  //   return GetBookmarkByIdResponseDto.convertToDto(bookmark);
  // }

  @Get('search')
  async search(@Query('query') query: string): Promise<ISearchArticle[] | []> {
    if (!query) {
      return [];
    }
    const tagList = await this.bookmarkService.searchTerm(query);
    return tagList;
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

  @Patch(':id/metadata')
  async update(
    @Param('id') id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
  ) {
    const updatedId = await this.bookmarkService.update(id, updateBookmarkDto);
    return { id: updatedId };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const bookmark = await this.bookmarkService.remove(id);
    return GetBookmarkResponseDto.convertToDto(bookmark);
  }

  @Patch(':id/tags')
  async addTag(@Param('id') id: string, @Body() body: { tags: string[] }) {
    // validate length of tags
    const MAX_LIMIT = 5;
    if (0 > body?.tags?.length || body?.tags?.length > MAX_LIMIT) {
      throw new BadRequestException('Tags length should be between 1 and 5');
    }

    await this.bookmarkService.addTags(id, body.tags);

    return { id };
  }
}
