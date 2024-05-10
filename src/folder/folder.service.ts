import { Inject, Injectable, Logger } from '@nestjs/common';
import { Folder } from './schemas/folder.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { ClsService } from 'nestjs-cls';
import { Model } from 'mongoose';
import { IFolderDoc } from './interfaces/folder.interface';
import { BookmarkStateEnum } from 'src/bookmark/interfaces/bookmark.interface';

@Injectable()
/**
 * Self referencing model:
 * link: https://www.reddit.com/r/SQL/comments/rt3d9a/how_would_you_model_a_file_tree/
 * link: https://dba.stackexchange.com/questions/3023/best-design-for-adding-a-folder-file-relationship
 */
export class FolderService {
  private readonly logger = new Logger(FolderService.name);
  constructor(
    private readonly cls: ClsService,
    @InjectModel(Folder.name) private FolderModel: Model<IFolderDoc>,

    @Inject(BookmarkService)
    private readonly bookmarkService: BookmarkService,
  ) {}

  async getDataInsideFolder({
    id = null,
    page,
    limit,
  }: {
    id: string;
    page: string;
    limit: string;
  }) {
    const foldersResult = await this.FolderModel.find({
      $or: [
        { id }, // curr folder
        { parentFolderId: id }, // all nested folders
      ],
    })
      .sort({ createdAt: 'desc' })
      .lean();

    console.log(
      '🚀 ~ FolderService ~ getAllDataInsideFolder ~ foldersResult:',
      JSON.stringify(foldersResult, null, 4),
    );

    const bookmarksListResult = await this.bookmarkService.findAllWithState(
      page,
      limit,
      BookmarkStateEnum.AVAILABLE,
    );

    console.log(
      '🚀 ~ FolderService ~ getAllDataInsideFolder ~ bookmarksListResult:',
      JSON.stringify(bookmarksListResult, null, 4),
    );

    return { folders: { data: foldersResult }, bookmarks: bookmarksListResult };
  }
}
