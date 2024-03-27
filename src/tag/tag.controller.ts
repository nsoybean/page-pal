import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TagService } from './tag.service';

@Controller('tag')
@UseGuards(AuthGuard('jwt'))
export class TagController {
  constructor(private readonly TagService: TagService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create() {
    throw new Error('Not implemented');
  }

  async getAllUserTags() {
    throw new Error('Not implemented');
  }

  async renameTag() {
    throw new Error('Not implemented');
  }

  async getBookmarkByTags() {
    throw new Error('Not implemented');
  }
}
