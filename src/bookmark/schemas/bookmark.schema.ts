import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BookmarkStateEnum } from '../interfaces/bookmark.interface';
import { Tag } from 'src/tag/schemas/tag.schema';
/**
 * The @Schema() decorator marks a class as a schema definition. It maps our 'Save' class to a MongoDB collection of the same name,
 * but with an additional “s” at the end - so the final mongo collection name will be 'saves'.
 */
@Schema({ timestamps: true })
export class Bookmark {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  userId: string;

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

  @Prop()
  color: string;

  @Prop({ type: [String], ref: Tag.name })
  tags: Tag[];

  // added to schema decorator above
  // note: do not use 'Date.now()' as this assigns a default val to the model
  // and cause all documents to have same timestamp
  // @Prop({ type: Date, default: Date.now })
  // createdAt: Date;

  // @Prop({ type: Date, default: Date.now })
  // updatedAt: Date;

  @Prop({ default: BookmarkStateEnum.AVAILABLE })
  state: string;

  @Prop({ default: '' })
  note: string;

  @Prop({ default: '' })
  icon: string;
}

// factory method to create schema
// to be init in module
export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

// bookmark tagged with zero or more tags
BookmarkSchema.virtual(
  'tagIds', // use this 'name' to populate
  {
    ref: 'Tag', // The model to use
    localField: 'tags', // The field in BookmarkSchema
    foreignField: 'id', // The field on tag. This can be whatever you want.
  },
);
