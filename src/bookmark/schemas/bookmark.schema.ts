import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BookmarkStateEnum } from '../interfaces/bookmark.interface';
import { Tag } from 'src/tag/schemas/tag.schema';
import mongoose from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Folder } from 'src/folder/schemas/folder.schema';
/**
 * The @Schema() decorator marks a class as a schema definition. It maps our 'Save' class to a MongoDB collection of the same name,
 * but with an additional “s” at the end - so the final mongo collection name will be 'saves'.
 */
@Schema({ timestamps: true })
export class Bookmark {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  userId: User;

  @Prop({ required: true })
  title: string;

  @Prop()
  image: string;

  @Prop({ required: true })
  link: string;

  @Prop()
  domain: string;

  @Prop({ default: '' })
  type: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Tag.name, index: true })
  tags: Tag[];

  @Prop({ default: BookmarkStateEnum.AVAILABLE, index: true })
  state: string;

  @Prop({ default: '' })
  icon: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Folder.name,
    index: true,
    sparse: true,
  })
  parentFolderId: string;
}

// factory method to create schema
// to be init in module
export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);
