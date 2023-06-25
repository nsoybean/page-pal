import { Document } from 'mongoose';

/**
 * As the developer are responsible for ensuring that your document interface lines up with your Mongoose schema.
 * For example, Mongoose won't report an error if email is required in your Mongoose schema but optional in your document interface
 * Link: https://mongoosejs.com/docs/typescript.html
 */
export interface IBookmarkDoc extends Document {
  readonly id: string;
  userId: string;
  title: string;
  link: string;
  readonly createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

export interface IListBookmarks {
  total_records: number;
  data: IBookmarkDoc[];
}
