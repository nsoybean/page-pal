import {
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import got from 'got';
import { JSDOM } from 'jsdom';
import { Model } from 'mongoose';
import { ClsService } from 'nestjs-cls';
import { ParseResultType, parseDomain } from 'parse-domain';
import { v4 as uuidv4 } from 'uuid';

import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { IBookmarkDoc, IListBookmarks } from './interfaces/bookmark.interface';
import { Bookmark } from './schemas/bookmark.schema';

@Injectable()
export class BookmarkService {
  constructor(
    private readonly cls: ClsService,
    @InjectModel(Bookmark.name) private bookmarkModel: Model<IBookmarkDoc>,
  ) {}

  async create(createBookmarkDto: CreateBookmarkDto): Promise<IBookmarkDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user.id;

    // init doc
    const newBookmark = new this.bookmarkModel(createBookmarkDto);

    try {
      const title = await this.getTitleFromLink(createBookmarkDto.link);
      newBookmark.title = title;
      newBookmark.id = uuidv4();
      newBookmark.userId = ctxUserId;
      return newBookmark.save();
    } catch (error) {
      throw new UnprocessableEntityException();
    }
  }

  async findAll() {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user.id;

    const docCount = await this.bookmarkModel.countDocuments({
      userId: ctxUserId,
    });

    const bookmarks = await this.bookmarkModel
      .find({ userId: ctxUserId })
      .lean();

    const result: IListBookmarks = {
      total_records: docCount,
      data: bookmarks,
    };

    return result;
  }

  async findOne(id: string): Promise<IBookmarkDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user.id;

    const bookmark = await this.bookmarkModel.findOne({
      id: id,
      userId: ctxUserId,
      deleted: false,
    });

    if (!bookmark) {
      throw new NotFoundException();
    }

    return bookmark;
  }

  update(id: string, updateBookmarkDto: UpdateBookmarkDto) {
    throw new NotImplementedException();
  }

  async remove(id: string) {
    const bookmark = await this.findOne(id);

    if (bookmark) {
      // soft delete
      bookmark.deleted = true;
      bookmark.updatedAt = new Date();
      return bookmark.save();
    } else {
      throw new NotFoundException();
    }
  }

  /**
   *
   * @param link
   * @returns title of article
   *  Extracts the title from the given link with fallback strategies.
   *  First, attempts to extract from the link itself.
   *  If unsuccessful, tries to extract from the link domain name.
   *  If all else fails, falls back to a hard-coded string.
   */
  async getTitleFromLink(link: string): Promise<string> {
    try {
      const httpResponse = await got(link);

      const dom = new JSDOM(httpResponse.body);

      // 1st attempt: get title from link
      let title: string =
        dom.window.document.querySelector('title').textContent;

      // 2nd attempt: get title from url domain
      if (title === '') {
        const parseResult = parseDomain(link);
        if (parseResult.type === ParseResultType.Listed) {
          const { subDomains, domain, topLevelDomains } = parseResult;
          console.log(
            `[SavesSvc][getTitleFromLink] Parsed domain for link: ${link}, subDomain: ${subDomains}, domain: ${domain}, topLevelDomain: ${topLevelDomains}`,
          );
          // 3rd attempt: hard coded title
          title = domain || 'Article';
        }
      }

      return title;
    } catch (error) {
      console.log(
        `[BkmkSvc][getTitleFromLink] Failed GET request to link: ${link}, error: ${error.message}`,
      );
      throw error;
    }
  }
}
