import {
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

  async getFolderByIdWithSubFolders({
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

  async create({
    parentFolderId,
    name,
  }: {
    parentFolderId: string;
    name: string;
  }): Promise<IFolderDoc> {
    const ctx = this.cls.get('ctx');
    const ctxUserId = ctx.user._id;

    const newFolder = await this.folderModel.create({
      userId: ctxUserId,
      parentFolderId,
      name,
    });

    return newFolder;
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
