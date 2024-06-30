import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { Folder } from './schemas/folder.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { ClsService } from 'nestjs-cls';
import { Model } from 'mongoose';
import { FolderStateEnum, IFolderDoc } from './interfaces/folder.interface';
import { BookmarkStateEnum } from 'src/bookmark/interfaces/bookmark.interface';
import { UserService } from 'src/user/user.service';

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
    @InjectModel(Folder.name) private folderModel: Model<IFolderDoc>,

    @Inject(UserService)
    private readonly userService: UserService,

    @Inject(forwardRef(() => BookmarkService))
    private bookmarkService: BookmarkService,
  ) {}

  async getSubFolderInFolderId({
    folderId,
    state = FolderStateEnum.AVAILABLE,
  }: {
    folderId: string;
    state?: FolderStateEnum;
  }): Promise<IFolderDoc[]> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    const result = await this.folderModel
      .find({
        userId: ctxUserId,
        state,
        $or: [
          { _id: folderId }, // curr folder
          { parentFolderId: folderId }, // all nested folders
        ],
      })
      .select(['_id', 'name', 'parentFolderId', 'createdAt'])
      .sort({ createdAt: 'desc' })
      .lean();

    return result;
  }

  async getParentFolderOfFolderId({
    folderId,
    state = FolderStateEnum.AVAILABLE,
  }: {
    folderId: string;
    state?: FolderStateEnum;
  }): Promise<{
    maxDepthLookupReached: boolean;
    list: { _id: string; name: string }[];
  }> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    const MAX_DEPTH = 5; // max returns 5 levels of parent folder
    let depth = 0;
    let parentFolderHierarchyList: { _id: string; name: string }[] = [];
    let currFolderId: any = folderId;
    // + 1 since it include curr folder
    while (parentFolderHierarchyList.length < MAX_DEPTH + 1) {
      const result = await this.folderModel
        .findOne({
          _id: currFolderId,
          userId: ctxUserId,
          state,
        })
        .populate({
          path: 'parentFolderId',
          select: ['_id', 'name', 'parentFolderId'],
        })
        .lean();

      parentFolderHierarchyList.push({
        _id: result._id,
        name: result.name,
      });

      depth++;

      // if parent folder does exist
      if (result && result.parentFolderId) {
        currFolderId = result.parentFolderId;
      } else {
        // if parent folder does not exist
        currFolderId = null;
        break;
      }
    }

    let result = {
      // if still have curr folder, it means it has stopped traversing because of max depth
      maxDepthLookupReached: currFolderId ? true : false,
      list: parentFolderHierarchyList,
    };
    this.logger.debug(
      `[getParentFolderOfFolderId] result: ${JSON.stringify(result, null, 2)}`,
    );

    return result;
  }

  async create({
    parentFolderId,
    name,
  }: {
    parentFolderId: string;
    name: string;
  }): Promise<IFolderDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    // temp pre-req query till mongo unique index impl
    const queriedFolder = await this.folderModel.find({});
    if (queriedFolder) {
      throw new ConflictException('Duplicated folder name');
    } else {
      const newFolder = await this.folderModel.create({
        userId: ctxUserId,
        parentFolderId,
        name,
      });

      return newFolder;
    }
  }

  async update({
    id,
    name,
  }: {
    id: string;
    name: string;
  }): Promise<IFolderDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    const res = await this.folderModel.findOneAndUpdate(
      { _id: id, userId: ctxUserId },
      { name: name },
    );

    if (res.isModified) {
      return res;
    } else {
      throw new UnprocessableEntityException('Folder not updated!');
    }
  }

  async delete({ id }: { id: string }): Promise<IFolderDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    try {
      // deleting all content inside folder
      await this.bookmarkService.deleteAllBookmarksByFolderId({
        folderId: id,
      });

      await this.deleteAllFoldersByParentFolderId({ parentFolderId: id });

      // deleting folder itself
      const res = await this.folderModel.findOneAndUpdate(
        {
          _id: id,
          userId: ctxUserId,
          state: FolderStateEnum.AVAILABLE,
        },
        { $set: { state: FolderStateEnum.DELETED } },
      );

      if (res && res.isModified) {
        return res;
      } else {
        throw new NotFoundException('Folder not found!');
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting folder and its content!',
      );
    }
  }

  async get({ id }: { id: string }) {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    return await this.folderModel.findById({
      _id: id,
      userId: ctxUserId,
      state: FolderStateEnum.AVAILABLE,
    });
  }

  async deleteAllFoldersByParentFolderId({
    parentFolderId,
  }: {
    parentFolderId: string;
  }): Promise<void> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    await this.folderModel.updateMany(
      {
        parentFolderId,
        userId: ctxUserId,
        state: FolderStateEnum.AVAILABLE,
      },
      { $set: { state: FolderStateEnum.DELETED } },
    );
  }
}
