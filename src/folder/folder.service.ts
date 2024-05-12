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
    folderId = null,
    page,
    limit,
  }: {
    folderId: string;
    page: string;
    limit: string;
  }) {
    console.log('🚀 ~ FolderService ~ folderId:', folderId);
    let promisesAll = [];

    // push articles query
    // note: if folderId is null, will return all articles at base level
    promisesAll.push(
      this.bookmarkService.findAllWithState(
        page,
        limit,
        BookmarkStateEnum.AVAILABLE,
        folderId,
      ),
    );

    // push folder query if any
    promisesAll.push(
      this.FolderModel.find({
        $or: [
          { id: folderId }, // curr folder
          { parentFolderId: folderId }, // all nested folders
        ],
      })
        .sort({ createdAt: 'desc' })
        .lean(),
    );

    try {
      const results = await Promise.all(promisesAll);
      console.log('🚀 ~ FolderService ~ results:', results);

      // return {
      //   bookmarks: results[0],
      //   folders: { data: results[1] },
      // };
      return {
        bookmarks: [],
        folders: { data: [] },
      };
    } catch (error) {
      this.logger.error(error);
    }
  }
}
