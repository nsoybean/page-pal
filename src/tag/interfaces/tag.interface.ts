import mongoose, { Document } from 'mongoose';
import { IUser } from 'src/user/interfaces/user.interface';

/**
 * As the developer are responsible for ensuring that your document interface lines up with your Mongoose schema.
 * For example, Mongoose won't report an error if email is required in your Mongoose schema but optional in your document interface
 * Link: https://mongoosejs.com/docs/typescript.html
 */

export interface ITagDoc extends Document {
  readonly _id: mongoose.ObjectId;
  name: string;
  userId: IUser['_id'];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IUpdateTag {
  id?: string;
  name: string;
}

export interface IListTags {
  total_records: number;
  data: ITagDoc[];
}
