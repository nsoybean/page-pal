import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { IListTags, ITagDoc } from './interfaces/tag.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from './schemas/tag.schema';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { Common } from 'src/library';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(
    private readonly cls: ClsService,
    @InjectModel(Tag.name) private tagModel: Model<ITagDoc>,

    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async findAll(page: string, limit: string): Promise<IListTags> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user.id;

    // compute skip and limit
    const skipLimitParam = Common.calculateSkipAndLimit(page, limit);

    const criteria = {
      userId: ctxUserId,
    };

    const docCount = await this.tagModel.countDocuments(criteria);

    const tags = await this.tagModel
      .find(criteria)
      .skip(skipLimitParam.skip)
      .limit(skipLimitParam.limit)
      .sort({ updatedAt: 'desc' })
      .lean();

    const result = {
      total_records: docCount,
      data: tags,
    };

    return result;
  }

  /**
   * get matched tags and their ids
   * @param tags
   * @returns array of tag objects, null if no match
   */
  async findIdsOfExistingTags(tags: string[]): Promise<ITagDoc[]> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user.id;
    // find all tags that exist in the database
    const res = await this.tagModel.find({
      userId: ctxUserId,
      name: { $in: tags },
    });

    if (!res) {
      return null;
    }

    return res;
  }

  async create(tags: string[]): Promise<ITagDoc[]> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user.id;

    // map array of tags into tag objects
    const tagObjects = tags.map((tag) => {
      return {
        name: tag,
        userId: ctxUserId,
        id: uuidv4(),
      };
    });

    const res = await this.tagModel.insertMany(tagObjects);

    return res;
  }

  async findTagIdByName(name: string): Promise<ITagDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user.id;

    const tag = await this.tagModel.findOne({
      userId: ctxUserId,
      name: name,
    });

    return tag;
  }
}
