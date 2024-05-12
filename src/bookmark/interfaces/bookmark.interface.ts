import { Document } from 'mongoose';

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
  readonly id: string;
  userId: string;
  title: string;
  image: string;
  link: string;
  domain: string;
  type: string;
  color: string;
  state: BookmarkStateEnum;
  readonly createdAt: Date; // init once
  updatedAt: Date;
  note?: string;
  description?: string;
  icon?: string;
  tags?: string[];
  tagIds?: { id: string; name: string }[];
  parentFolderId?: string;
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
