import {
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnprocessableEntityException,
  ConflictException,
  BadRequestException,
  Logger,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import got from 'got';
import { JSDOM } from 'jsdom';
import { Model } from 'mongoose';
import { ClsService } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';
import randomcolor from 'randomcolor';
import getMetaData, { MetaData } from 'metadata-scraper';

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
  ISearchArticle,
} from './interfaces/bookmark.interface';
import { Bookmark } from './schemas/bookmark.schema';
import { Common } from 'src/library';
import extractDomain from 'extract-domain';
import { Metadata, parser } from 'html-metadata-parser';
import { TagService } from 'src/tag/tag.service';
import { ITagDoc, IUpdateTag } from 'src/tag/interfaces/tag.interface';
@Injectable()
export class BookmarkService {
  private readonly logger = new Logger(BookmarkService.name);

  constructor(
    private readonly cls: ClsService,
    @InjectModel(Bookmark.name) private bookmarkModel: Model<IBookmarkDoc>,

    @Inject(TagService)
    private readonly tagService: TagService,
  ) {}

  // deprecated
  // async create(createBookmarkDto: CreateBookmarkDto): Promise<IBookmarkDoc> {
  //   const ctx = this.cls.get('ctx');
  //   const ctxUserId = ctx.user._id;

  //   // init doc
  //   const newBookmark = new this.bookmarkModel(createBookmarkDto);

  //   try {
  //     const title = await this.getTitleFromLink(createBookmarkDto.link);
  //     const image = await this.getImageFromLink(createBookmarkDto.link);
  //     const domain = extractDomain(createBookmarkDto.link) || '';

  //     newBookmark.title = title;
  //     newBookmark.domain = domain;
  //     newBookmark.image = image;
  //     newBookmark.id = uuidv4();
  //     newBookmark.userId = ctxUserId;
  //     return newBookmark.save();
  //   } catch (error) {
  //     throw new UnprocessableEntityException();
  //   }
  // }

  // deprecated
  // /**
  //  *
  //  * @param createBookmarkDto
  //  * @returns IBookmarkDoc
  //  * Parse url using npm library. Perform manual parsing only if first approach fails
  //  */
  // async createV2(createBookmarkDto: CreateBookmarkDto): Promise<IBookmarkDoc> {
  //   const ctx = this.cls.get('ctx');
  //   const ctxUserId = ctx.user._id;

  //   // init doc
  //   const newBookmark = new this.bookmarkModel(createBookmarkDto);
  //   newBookmark.id = uuidv4();
  //   newBookmark.userId = ctxUserId;
  //   newBookmark.color = randomcolor({ luminosity: 'light' });

  //   try {
  //     // first approach: using npm lib to parse url
  //     const {
  //       data: npmParsedUrl,
  //       error: npmParseUrlErr,
  //     }: { data: IBookmarkMeta; error: Error } = await Common.pWrap(
  //       this.parseUrlWithHtmlMetaDataParser(newBookmark.link),
  //     );

  //     if (npmParsedUrl) {
  //       Object.assign(newBookmark, npmParsedUrl);
  //       return newBookmark.save();
  //     }

  //     // second approach: manual parse
  //     if (npmParseUrlErr) {
  //       const title = await this.getTitleFromLink(createBookmarkDto.link);
  //       const image = await this.getImageFromLink(createBookmarkDto.link);
  //       const domain = extractDomain(createBookmarkDto.link) || '';

  //       const manualParseUrlMeta: IBookmarkMeta = {
  //         title,
  //         image,
  //         domain,
  //       };
  //       Object.assign(newBookmark, manualParseUrlMeta);
  //       return newBookmark.save();
  //     }
  //   } catch (error) {
  //     throw new UnprocessableEntityException();
  //   }
  // }

  /**
   *
   * @param createBookmarkDto
   * @returns IBookmarkDoc
   * Parse url using npm library. Perform manual parsing only if first approach fails
   */
  async createV3(link: string): Promise<IBookmarkDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    // parse using metadata-scraper
    const {
      data: metaData,
      error: getMetaDataErr,
    }: { data: MetaData; error: Error } = await Common.pWrap(getMetaData(link));

    if (getMetaDataErr) {
      this.logger.debug(
        `[metadata-scraper] Invalid url: ${link}, error: ${getMetaDataErr.message}`,
      );
      throw new UnprocessableEntityException();
    }

    if (metaData) {
      const newBookmark = await this.bookmarkModel.create({
        userId: ctxUserId,
        link,
        image: metaData.image,
        title: metaData?.title || link,
        description: metaData?.description || '',
        type: metaData.type,
        icon: metaData.icon,
        domain: metaData.provider,
      });

      // log for local dev
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(
          `metadata-scraper for link ${newBookmark.link}:${JSON.stringify(
            newBookmark,
          )}`,
        );
      }
      return newBookmark;
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
      description:
        parsedUrlData.meta?.description || parsedUrlData.og?.description || '',
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
    parentFolderId?: string,
    tag?: string,
  ): Promise<IListBookmarks> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    // compute skip and limit
    const skipLimitParam = Common.calculateSkipAndLimit(page, limit);

    const criteria = {
      userId: ctxUserId,
      state: state,
    };

    // if query by tag exist
    if (tag) {
      const tagDoc = await this.tagService.findTagIdByName(tag);
      if (!tagDoc) {
        throw new NotFoundException(`Tag ${tag} not found`);
      }
      criteria['tags'] = { $in: [tagDoc._id] };
    }

    if (parentFolderId) {
      criteria['parentFolderId'] = parentFolderId;
    }
    console.log('🚀 ~ BookmarkService ~ criteria:', criteria);

    const docCount = await this.bookmarkModel.countDocuments(criteria);

    const bookmarks = await this.bookmarkModel
      .find(criteria)
      .select([
        '_id',
        'title',
        'image',
        'link',
        'domain',
        'type',
        'description',
        'tags',
        'state',
      ])
      .skip(skipLimitParam.skip)
      .limit(skipLimitParam.limit)
      .sort({ createdAt: 'desc' })
      .populate('tags', { _id: 1, name: 1 })
      .lean();

    const result = {
      total_records: docCount,
      data: bookmarks,
    };

    return result;
  }

  async findDocById(id: string): Promise<IBookmarkDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    const bookmark = await this.bookmarkModel.findOne({
      _id: id,
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

  /**
   * find bookmark by id, return full data, including referenced model
   * @param id bookmark id
   * @returns
   */
  async findOneFullData(id: string): Promise<IBookmarkDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    const bookmark = await this.bookmarkModel
      .findOne({
        _id: id,
        userId: ctxUserId,
        $or: [
          { state: BookmarkStateEnum.AVAILABLE },
          { state: BookmarkStateEnum.ARCHIVED },
        ],
      })
      .populate('tags', { _id: 1, name: 1 })
      .lean();

    if (!bookmark) {
      throw new NotFoundException();
    }

    return bookmark;
  }

  async update(
    id: string,
    updateBookmarkDto: UpdateBookmarkDto,
  ): Promise<string> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    await this.bookmarkModel.updateOne(
      { _id: id, userId: ctxUserId },
      { title: updateBookmarkDto.title },
    );

    return id;

    throw new NotFoundException();
  }

  async archive(id: string) {
    const bookmark = await this.findDocById(id);

    if (bookmark) {
      if (bookmark.state === BookmarkStateEnum.ARCHIVED) {
        throw new ConflictException(
          `Conflict with current state. Resource already in '${BookmarkStateEnum.ARCHIVED}' state`,
        );
      }

      await this.bookmarkModel.updateOne(
        { _id: id },
        { $set: { state: BookmarkStateEnum.ARCHIVED } },
      );

      return id;
    } else {
      throw new NotFoundException();
    }
  }

  async unarchive(id: string) {
    const bookmark = await this.findDocById(id);

    if (bookmark) {
      if (bookmark.state === BookmarkStateEnum.AVAILABLE) {
        throw new ConflictException(
          `Conflict with current state. Resource already in '${BookmarkStateEnum.AVAILABLE}' state`,
        );
      }
      await this.bookmarkModel.updateOne(
        { _id: id },
        { $set: { state: BookmarkStateEnum.AVAILABLE } },
      );

      return id;
    } else {
      throw new NotFoundException();
    }
  }

  async remove(id: string) {
    const bookmark = await this.findDocById(id);

    if (bookmark) {
      if (bookmark.state === BookmarkStateEnum.DELETED) {
        throw new ConflictException(
          `Conflict with current state. Resource already in '${BookmarkStateEnum.DELETED}' state`,
        );
      }
      // soft delete
      await this.bookmarkModel.updateOne(
        { _id: id },
        { $set: { state: BookmarkStateEnum.DELETED } },
      );

      return id;
    } else {
      throw new NotFoundException();
    }
  }

  /**
   *
   * @param id bookmark id to add tags to
   * @param tags array of tags
   * @returns boolean, whether tags were added successfully
   */
  async addTags(id: string, tags: string[]): Promise<boolean> {
    const bookmark = await this.findOneFullData(id);

    // forward to tagService, to find and return matched tags
    const existingTagsObjList = await this.tagService.findIdsOfExistingTags(
      tags,
    );

    let tagsToCreate: string[] = [];
    if (!existingTagsObjList || existingTagsObjList?.length === 0) {
      // if no existing tags, all new
      tagsToCreate = tags;
    } else {
      // filter to exclude existing tags
      tagsToCreate = tags.filter(
        (tag) =>
          !existingTagsObjList.some((existingTag) => existingTag.name === tag),
      );
    }

    // check user's current tags count
    const FREE_TIER_TAG_COUNT_LIMIT = 50;
    const userTagsCount = await this.tagService.countUserTags();
    if (
      userTagsCount &&
      userTagsCount + tagsToCreate.length > FREE_TIER_TAG_COUNT_LIMIT
    ) {
      throw new BadRequestException(
        `Free tier limit reached. Max tags allowed: ${FREE_TIER_TAG_COUNT_LIMIT}`,
      );
    }

    const newTags: ITagDoc[] = await this.tagService.create(tagsToCreate);

    // merge two tags array
    const existingAndNewTags = [...existingTagsObjList, ...newTags];
    this.logger.debug(
      `[addTags] Input tags: ${tags.length}. Existing tags: ${existingTagsObjList.length}, new tags: ${newTags.length}. BkmkId: ${id}.`,
    );

    if (existingAndNewTags.length !== tags.length) {
      this.logger.debug(
        `[addTags]  Summation of existing and new does not match input. Error in creating tags. Input tags: ${tags.length}. Existing tags: ${existingTagsObjList.length}, new tags: ${newTags.length}. BkmkId: ${id}.`,
      );
      throw new InternalServerErrorException('Error in creating tags');
    }

    // reorder as request input
    const orderedTags = tags.map((tag) =>
      existingAndNewTags.find((t) => t.name === tag),
    );

    // embed tags ids into bookmark
    await this.bookmarkModel.updateOne(
      { _id: bookmark._id },
      { $set: { tags: orderedTags.map((tag) => tag._id) } }, // update tags field
      { timestamps: false }, // do not update timestamp so as to not re-order client side render
    );

    // find tag removed from bookmark
    const currTags = bookmark.tags;
    const untaggedTags = currTags.filter(
      (currTag) => !tags.includes(currTag.name),
    );

    if (currTags.length >= 0) {
      // get their ids
      const untaggedTagIds = untaggedTags.map((tag) => tag._id);
      // check if each tag is referenced, delete if not
      for (const tagId of untaggedTagIds) {
        const isReferenced = await this.isTagReferenced(tagId.toString());
        if (!isReferenced) {
          await this.tagService.delete(tagId.toString());
        }
      }
    }

    return true;
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

  async isTagReferenced(tagId: string): Promise<boolean> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    const res = await this.bookmarkModel.findOne({
      _id: tagId,
      userId: ctxUserId,
      $or: [
        { state: BookmarkStateEnum.AVAILABLE },
        { state: BookmarkStateEnum.ARCHIVED },
      ],
      tags: { $in: [tagId] },
    });

    // true if referenced, false otherwise
    return !!res;
  }

  async searchTerm(term: string): Promise<ISearchArticle[]> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    let result = await this.bookmarkModel.aggregate([
      {
        $search: {
          index: 'bookmark-search',
          compound: {
            should: [
              {
                autocomplete: {
                  query: `${term.trim()}`,
                  path: 'title',
                  fuzzy: {
                    maxEdits: 2,
                    prefixLength: 2,
                  },
                },
              },
              {
                autocomplete: {
                  query: `${term.trim()}`,
                  path: 'description',
                  fuzzy: {
                    maxEdits: 2,
                    prefixLength: 2,
                  },
                },
              },
              {
                autocomplete: {
                  query: `${term.trim()}`,
                  path: 'link',
                  fuzzy: {
                    maxEdits: 2,
                    prefixLength: 2,
                  },
                },
              },
            ],
            minimumShouldMatch: 1,
          },
        },
      },
      {
        $match: {
          userId: ctxUserId, // Assuming ctxUserId is the user ID you want to filter by
          state: {
            $ne: BookmarkStateEnum.DELETED,
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          id: 1,
          title: 1,
          link: 1,
          description: 1,
          state: 1,
          createdAt: 1,
        },
      },
    ]);

    if (result) {
      return result;
    } else return [];
  }
}
