import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Bookmark } from 'src/bookmark/schemas/bookmark.schema';

/**
 * The @Schema() decorator marks a class as a schema definition. It maps our 'Save' class to a MongoDB collection of the same name,
 * but with an additional “s” at the end - so the final mongo collection name will be 'saves'.
 */
@Schema({ timestamps: true })
export class Folder {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  // @Prop({ index: true, sparse: true }) // spares required as not all documents has parentFolderId field
  // parentFolderId: Folder;
  parentFolderId: [this];
}

// factory method to create schema
// to be init in module
export const FolderSchema = SchemaFactory.createForClass(Folder);

// folder with one or more files
// FolderSchema.virtual(
//   'bookmarkId', // use this 'name' to populate
//   {
//     ref: 'Bookmark', // The model to use
//     localField: 'bookmarkId', // The field in FolderSchema
//     foreignField: 'id', // The field on bookmark. This can be whatever you want.
//   },
// );

// folder can have parent folder
FolderSchema.virtual(
  'parentFolder', // use this 'name' to populate
  {
    ref: 'Folder', // The model to use
    localField: 'parentFolderId', // The field in FolderSchema
    foreignField: 'id', // The field on Folder. This can be whatever you want.
  },
);
