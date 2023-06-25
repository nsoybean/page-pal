import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, now } from 'mongoose';

/**
 * The @Schema() decorator marks a class as a schema definition. It maps our 'Save' class to a MongoDB collection of the same name,
 * but with an additional “s” at the end - so the final mongo collection name will be 'saves'.
 */
@Schema()
export class Bookmark {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  link: string;

  @Prop({ type: Date, default: now() })
  createdAt: Date;

  @Prop({ type: Date, default: now() })
  updatedAt: Date;

  @Prop({ default: false })
  deleted: boolean;
}

// factory method to create schema
// to be init in module
export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);
