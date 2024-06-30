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
  Logger,
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
  private readonly logger = new Logger(BookmarkController.name);
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
    // map to null if 'root' is passed
    if (createBookmarkDto.parentFolderId === 'root') {
      createBookmarkDto.parentFolderId = null;
    }

    const newBookmark = await this.bookmarkService.createV3({
      link: createBookmarkDto.link.trim(),
      parentFolderId: createBookmarkDto.parentFolderId,
    });
    return { id: newBookmark._id.toString() };
  }

  @Get()
  async findAllSavesAndFolders(
    @Query('folderId') folderId?: string, // optional
    @Query('page') page?: string, // optional
    @Query('limit') limit?: string, // optional
    @Query('tag') tag?: string, // optional
  ) {
    this.logger.debug(
      `[findAllSavesAndFolders] args: ${JSON.stringify(
        { folderId, page, limit, tag },
        null,
        2,
      )}`,
    );
    // if 'root' folder is passed, get saves and folders within root
    if (folderId) {
      this.logger.debug(`[findAllSavesAndFolders][folderId query]`);
      const listData = await this.bookmarkService.findAllSavesAndFolders({
        folderId: folderId === 'root' ? null : folderId,
        page,
        limit,
        bookmarkState: BookmarkStateEnum.AVAILABLE,
      });
      return listData;
    } else if (!folderId && tag) {
      this.logger.debug(`[findAllSavesByOptionalTag][!folderId query]`);
      // if folderId is not passed
      const listData = await this.bookmarkService.findAllSavesByOptionalTag({
        page,
        limit,
        state: BookmarkStateEnum.AVAILABLE,
        tag,
      });

      return { bookmarks: listData };
    }
  }

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
    return { id: bookmarkId };
  }

  @Patch(':id/unarchive')
  async unarchive(@Param('id') id: string) {
    const bookmarkId = await this.bookmarkService.unarchive(id);
    return { id: bookmarkId };
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
    return { id: bookmarkId };
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

  @Patch('move')
  async moveBookmarks(
    @Body() body: { bookmarkIds: string[]; folderId: string },
  ) {
    await this.bookmarkService.moveBookmarksInfoFolder({
      bookmarkIds: body.bookmarkIds,
      folderId: body.folderId,
    });

    return { result: body.bookmarkIds };
  }
}
