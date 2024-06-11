import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Bookmark } from 'src/bookmark/schemas/bookmark.schema';
import { User } from 'src/user/schemas/user.schema';
import { FolderStateEnum } from '../interfaces/folder.interface';

/**
 * The @Schema() decorator marks a class as a schema definition. It maps our 'Save' class to a MongoDB collection of the same name,
 * but with an additional “s” at the end - so the final mongo collection name will be 'saves'.
 */
@Schema({ timestamps: true })
export class Folder {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    index: true,
    sparse: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Folder.name,
  }) // spares required as not all documents has parentFolderId field
  parentFolderId: [this];

  @Prop({ default: FolderStateEnum.AVAILABLE, index: true })
  state: string;
}

// factory method to create schema
// to be init in module
export const FolderSchema = SchemaFactory.createForClass(Folder);
