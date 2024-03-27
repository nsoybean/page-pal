import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { BookmarkStateEnum } from '../interfaces/bookmark.interface';
/**
 * The @Schema() decorator marks a class as a schema definition. It maps our 'Tag' class to a MongoDB collection of the same name,
 * but with an additional “s” at the end - so the final mongo collection name will be 'Tags'.
 */
@Schema({ timestamps: true })
export class Tag {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  userId: string;
}

// factory method to create schema
// to be init in module
export const TagSchema = SchemaFactory.createForClass(Tag);
