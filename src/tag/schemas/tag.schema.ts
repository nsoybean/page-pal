import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
/**
 * The @Schema() decorator marks a class as a schema definition. It maps our 'Tag' class to a MongoDB collection of the same name,
 * but with an additional “s” at the end - so the final mongo collection name will be 'Tags'.
 */
@Schema({ timestamps: true })
export class Tag {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  userId: string;

  @Prop({ required: true, index: true })
  name: string;
}

// factory method to create schema
// to be init in module
export const TagSchema = SchemaFactory.createForClass(Tag);

export interface ITag {
  title: string;
  image: string;
  domain: string;
  type?: string;
  description?: string;
}
