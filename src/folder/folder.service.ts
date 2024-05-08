import { Inject, Injectable, Logger } from '@nestjs/common';
import { Folder } from './schemas/folder.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { ClsService } from 'nestjs-cls';
import { Model } from 'mongoose';
import { IFolderDoc } from './interfaces/folder.interface';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);
  constructor(
    private readonly cls: ClsService,
    @InjectModel(Folder.name) private FolderModel: Model<IFolderDoc>,

    @Inject(BookmarkService)
    private readonly bookmarkService: BookmarkService,
  ) {}

  async getAllDataInsideFolder() {
    console.log('hihihi');

    const bookmarks = await this.FolderModel.find({
      $or: [
        { id: '8f567d7c-5785-4f62-b55a-75f586ee121' },
        { parentFolderId: '8f567d7c-5785-4f62-b55a-75f586ee121' },
      ],
    })
      // .skip(skipLimitParam.skip)
      // .limit(skipLimitParam.limit)
      .sort({ createdAt: 'desc' })
      .populate('bookmarkId', { id: 1, title: 1, _id: 0 })
      .populate('parentFolderId', { id: 1, name: 1, _id: 0 })
      .lean();

    console.log(
      '🚀 ~ FolderService ~ getAllDataInsideFolder ~ bookmarks:',
      JSON.stringify(bookmarks),
    );
  }
}
