import { Document } from 'mongoose';

/**
 * As the developer are responsible for ensuring that your document interface lines up with your Mongoose schema.
 * For example, Mongoose won't report an error if email is required in your Mongoose schema but optional in your document interface
 * Link: https://mongoosejs.com/docs/typescript.html
 */

export interface ITagDoc extends Document {
  readonly id: string;
  name: string;
  userId: string;
  readonly createdAt: Date; // init once
  updatedAt: Date;
}

export interface IUpdateTag {
  id?: string;
  name: string;
}

export interface IListTags {
  total_records: number;
  data: ITagDoc[];
}
