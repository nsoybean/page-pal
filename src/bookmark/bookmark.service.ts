import {
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnprocessableEntityException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import got from 'got';
import { JSDOM } from 'jsdom';
import { Model } from 'mongoose';
import { ClsService } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';
import randomcolor from 'randomcolor';

// import { Doc } from 'yjs';
// import { CreateBookmarkDto } from './dto/create-bookmark.dto';
// import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

import {
  CreateBookmarkDto,
  UpdateBookmarkDto,
  UpdateBookmarkNoteDto,
} from './dto/index';
import {
  IBookmarkDoc,
  IListBookmarks,
  IBookmarkMeta,
  BookmarkStateEnum,
} from './interfaces/bookmark.interface';
import { Bookmark } from './schemas/bookmark.schema';
import { Common } from 'src/library';
import extractDomain from 'extract-domain';
import { Metadata, parser } from 'html-metadata-parser';
@Injectable()
export class BookmarkService {
  private readonly logger = new Logger(BookmarkService.name);

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
      const image = await this.getImageFromLink(createBookmarkDto.link);
      const domain = extractDomain(createBookmarkDto.link) || '';

      newBookmark.title = title;
      newBookmark.domain = domain;
      newBookmark.image = image;
      newBookmark.id = uuidv4();
      newBookmark.userId = ctxUserId;
      return newBookmark.save();
    } catch (error) {
      throw new UnprocessableEntityException();
    }
  }

  /**
   *
   * @param createBookmarkDto
   * @returns IBookmarkDoc
   * Parse url using npm library. Perform manual parsing only if first approach fails
   */
  async createV2(createBookmarkDto: CreateBookmarkDto): Promise<IBookmarkDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user.id;

    // init doc
    const newBookmark = new this.bookmarkModel(createBookmarkDto);
    newBookmark.id = uuidv4();
    newBookmark.userId = ctxUserId;
    newBookmark.color = randomcolor({ luminosity: 'light' });

    try {
      // first approach: using npm lib to parse url
      const {
        data: npmParsedUrl,
        error: npmParseUrlErr,
      }: { data: IBookmarkMeta; error: Error } = await Common.pWrap(
        this.parseUrlWithHtmlMetaDataParser(newBookmark.link),
      );

      if (npmParsedUrl) {
        Object.assign(newBookmark, npmParsedUrl);
        return newBookmark.save();
      }

      // second approach: manual parse
      if (npmParseUrlErr) {
        const title = await this.getTitleFromLink(createBookmarkDto.link);
        const image = await this.getImageFromLink(createBookmarkDto.link);
        const domain = extractDomain(createBookmarkDto.link) || '';

        const manualParseUrlMeta: IBookmarkMeta = {
          title,
          image,
          domain,
          type: '',
        };
        Object.assign(newBookmark, manualParseUrlMeta);
        return newBookmark.save();
      }
    } catch (error) {
      throw new UnprocessableEntityException();
    }
  }

  /**
   *
   * @param url string
   * @returns IBookmarkMeta
   */
  async parseUrlWithHtmlMetaDataParser(url: string): Promise<IBookmarkMeta> {
    const {
      data: parsedUrlData,
      error: parseUrlErr,
    }: { data: Metadata; error: Error } = await Common.pWrap(parser(url));
    if (parseUrlErr) {
      this.logger.debug(
        `[parseUrlWithHtmlMetaDataParser] Failed to parse url with npm lib. Url: ${url}, error: ${parseUrlErr.message}`,
      );
      throw new UnprocessableEntityException();
    }

    // log for local dev
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(
        `[parseUrlWithHtmlMetaDataParser] parsedUrlData for link ${url}:${JSON.stringify(
          parsedUrlData,
        )}`,
      );
    }

    // get details from 'og' key, else 'meta' key, else hardcoded
    const bookmarkMetaData: IBookmarkMeta = {
      title: parsedUrlData.og?.title || parsedUrlData.meta.title || 'Article',
      // commented out temp as its giving a lot of false positive (blank images)
      // image:
      //   parsedUrlData.og?.image ||
      //   (parsedUrlData.images.length > 0 ? parsedUrlData.images[0].src : ''),
      image: parsedUrlData.og?.image || '',
      domain: parsedUrlData.og?.site_name || extractDomain(url) || '',
      type: parsedUrlData.og?.type || '',
    };

    // ensure if image is 'accessible' by performing GET req, else reset to empty string
    const { error } = await Common.pWrap(got(bookmarkMetaData.image));
    if (error) {
      bookmarkMetaData.image = '';
    }

    return bookmarkMetaData;
  }

  async findAllWithState(
    page: string,
    limit: string,
    state: BookmarkStateEnum,
  ): Promise<IListBookmarks> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user.id;

    // compute skip and limit
    const skipLimitParam = Common.calculateSkipAndLimit(page, limit);

    const docCount = await this.bookmarkModel.countDocuments({
      userId: ctxUserId,
      state: state,
    });

    const criteria = {
      userId: ctxUserId,
      state: state,
    };
    const bookmarks = await this.bookmarkModel
      .find(criteria)
      .skip(skipLimitParam.skip)
      .limit(skipLimitParam.limit)
      .sort({ updatedAt: 'desc' })
      .lean();

    const result = {
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
      $or: [
        { state: BookmarkStateEnum.AVAILABLE },
        { state: BookmarkStateEnum.ARCHIVED },
      ],
    });

    if (!bookmark) {
      throw new NotFoundException();
    }

    return bookmark;
  }

  update(id: string, updateBookmarkDto: UpdateBookmarkDto) {
    throw new NotImplementedException();
  }

  // TODO @sb: consider moving this y doc into another collection should this impact performance
  async updateNote(id: string, updateNoteDto: UpdateBookmarkNoteDto) {
    const bookmark = await this.bookmarkModel.findOne({
      id: id,
    });
    if (
      bookmark.state !== BookmarkStateEnum.AVAILABLE &&
      bookmark.state !== BookmarkStateEnum.ARCHIVED
    ) {
      throw new BadRequestException(`Resource not found`);
    }

    bookmark.note = updateNoteDto.note;
    bookmark.updatedAt = new Date();
    return bookmark.save();
  }
  async fetchNote(id: string): Promise<any> {
    const bookmark = await this.bookmarkModel.findOne({
      id: id,
    });
    if (bookmark.state !== BookmarkStateEnum.AVAILABLE) {
      throw new BadRequestException(`Resource not found`);
    }

    return bookmark.note;
  }

  async archive(id: string): Promise<IBookmarkDoc> {
    const bookmark = await this.findOne(id);

    if (bookmark) {
      if (bookmark.state === BookmarkStateEnum.ARCHIVED) {
        throw new ConflictException(
          `Conflict with current state. Resource already in '${BookmarkStateEnum.ARCHIVED}' state`,
        );
      }
      bookmark.state = BookmarkStateEnum.ARCHIVED;
      bookmark.updatedAt = new Date();
      return bookmark.save();
    } else {
      throw new NotFoundException();
    }
  }

  async unarchive(id: string): Promise<IBookmarkDoc> {
    const bookmark = await this.findOne(id);

    if (bookmark) {
      if (bookmark.state === BookmarkStateEnum.AVAILABLE) {
        throw new ConflictException(
          `Conflict with current state. Resource already in '${BookmarkStateEnum.AVAILABLE}' state`,
        );
      }
      bookmark.state = BookmarkStateEnum.AVAILABLE;
      bookmark.updatedAt = new Date();
      return bookmark.save();
    } else {
      throw new NotFoundException();
    }
  }

  async remove(id: string): Promise<IBookmarkDoc> {
    const bookmark = await this.findOne(id);

    if (bookmark) {
      if (bookmark.state === BookmarkStateEnum.DELETED) {
        throw new ConflictException(
          `Conflict with current state. Resource already in '${BookmarkStateEnum.DELETED}' state`,
        );
      }
      // soft delete
      bookmark.state = BookmarkStateEnum.DELETED;
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

      // temp comment out, to relook into
      // 2nd attempt: get title from url domain
      // if (title === '') {
      // const parseResult = parseDomain(link);
      // if (parseResult.type === ParseResultType.Listed) {
      //   const { subDomains, domain, topLevelDomains } = parseResult;
      //   console.log(
      //     `[SavesSvc][getTitleFromLink] Parsed domain for link: ${link}, subDomain: ${subDomains}, domain: ${domain}, topLevelDomain: ${topLevelDomains}`,
      //   );
      //   // 3rd attempt: hard coded title
      //   title = domain || 'Article';
      // }
      // }

      if (title === '') {
        title = 'Article';
      }

      return title;
    } catch (error) {
      this.logger.debug(
        `[getTitleFromLink] Failed GET request to link: ${link}, error: ${error.message}`,
      );
      throw error;
    }
  }

  async getImageFromLink(link: string): Promise<string> {
    let imageSrc = '';
    try {
      const httpResponse = await got(link);

      const dom = new JSDOM(httpResponse.body);

      const images = dom.window.document.querySelectorAll('img');
      // iterate over images and get largest image
      let maxImageSize = 0;
      images.forEach((element) => {
        const img = element.getAttribute('src');
        const width = element.getAttribute('width');
        const height = element.getAttribute('height');

        const imageSize = width * height;
        if (imageSize > maxImageSize || imageSrc === '') {
          imageSrc = img;
          maxImageSize = imageSize;
        }
      });

      // test if image is 'fetchable'
      const getImageResponse = await got(imageSrc);
      if (getImageResponse) {
        return imageSrc;
      } else {
        return '';
      }
    } catch (error) {
      this.logger.debug(
        `[BkmkSvc][getImageFromLink] Failed to get image from link. Image: ${imageSrc}, link: ${link}, error: ${error.message}`,
      );
      return '';
    }
  }
}
