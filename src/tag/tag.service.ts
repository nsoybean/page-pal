import { Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { ITagDoc } from './interfaces/tag.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from './schemas/tag.schema';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(
    private readonly cls: ClsService,
    @InjectModel(Tag.name) private bookmarkModel: Model<ITagDoc>,
  ) {}

  async create() {
    throw new Error('Not implemented');
  }
}
