import { Document } from 'mongoose';
import { IBookmarkDoc } from 'src/bookmark/interfaces/bookmark.interface';

/**
 * As the developer are responsible for ensuring that your document interface lines up with your Mongoose schema.
 * For example, Mongoose won't report an error if email is required in your Mongoose schema but optional in your document interface
 * Link: https://mongoosejs.com/docs/typescript.html
 */

export enum FolderStateEnum {
  AVAILABLE = 'AVAILABLE',
  DELETED = 'DELETED',
}

export interface IFolderDoc extends Document {
  readonly id: string;
  userId: string;
  name: string;
  parentFolderId: string;
  state: FolderStateEnum;
}
