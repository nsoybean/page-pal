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
} from './dto/index';
import {
  BookmarkStateEnum,
  ISearchArticle,
} from './interfaces/bookmark.interface';

@Controller('bookmark')
@UseGuards(AuthGuard('jwt'))
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  // deprecated
  // @UseInterceptors(ClassSerializerInterceptor)
  // @Post()
  // async create(@Body() createBookmarkDto: CreateBookmarkDto) {
  //   const newBookmark = await this.bookmarkService.create(createBookmarkDto);
  //   return CreateBookmarkResponseDto.convertToDto(newBookmark);
  // }

  // deprecated
  // @UseInterceptors(ClassSerializerInterceptor)
  // @Post('/v2')
  // async createV2(@Body() createBookmarkDto: CreateBookmarkDto) {
  //   const newBookmark = await this.bookmarkService.createV2(createBookmarkDto);
  //   return CreateBookmarkResponseDto.convertToDto(newBookmark);
  // }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/v3')
  async createV3(@Body() createBookmarkDto: CreateBookmarkDto) {
    const newBookmark = await this.bookmarkService.createV3(
      createBookmarkDto.link.trim(),
    );
    return newBookmark._id;
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
    return listData;
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
    return listData;
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
    const bookmarkId = await this.bookmarkService.archive(id);
    return bookmarkId;
  }

  @Patch(':id/unarchive')
  async unarchive(@Param('id') id: string) {
    const bookmarkId = await this.bookmarkService.unarchive(id);
    return bookmarkId;
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
    const bookmarkId = await this.bookmarkService.remove(id);
    return bookmarkId;
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
