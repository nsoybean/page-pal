import mongoose, { Document, Mongoose } from 'mongoose';
import { ITagDoc } from 'src/tag/interfaces/tag.interface';
import { IUser } from 'src/user/interfaces/user.interface';

/**
 * As the developer are responsible for ensuring that your document interface lines up with your Mongoose schema.
 * For example, Mongoose won't report an error if email is required in your Mongoose schema but optional in your document interface
 * Link: https://mongoosejs.com/docs/typescript.html
 */

export enum BookmarkStateEnum {
  AVAILABLE = 'AVAILABLE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}
export interface IBookmarkDoc extends Document {
  readonly _id: mongoose.ObjectId;
  userId: IUser['_id'];
  title: string;
  image: string;
  link: string;
  domain: string;
  type: string;
  color: string;
  state: BookmarkStateEnum;
  description?: string;
  icon?: string;
  tags?: ITagDoc[];
  parentFolderId?: IBookmarkDoc['_id'];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IBookmarkMeta {
  title: string;
  image: string;
  domain: string;
  type?: string;
  description?: string;
}

export interface IListBookmarks {
  total_records: number;
  data: IBookmarkDoc[];
}

export interface ISearchArticle {
  id: string;
  title: string;
  link: string;
  description: string;
  state: string;
  createdAt: Date;
}
