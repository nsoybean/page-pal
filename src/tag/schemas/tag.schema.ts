import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
/**
 * The @Schema() decorator marks a class as a schema definition. It maps our 'Tag' class to a MongoDB collection of the same name,
 * but with an additional “s” at the end - so the final mongo collection name will be 'Tags'.
 */
@Schema({ timestamps: true, _id: false })
export class Tag {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
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
