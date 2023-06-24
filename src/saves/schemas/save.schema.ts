import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, HydratedDocument } from 'mongoose';
import { now } from 'mongoose';

export type SaveDocument = HydratedDocument<Save>;

/**
 * The @Schema() decorator marks a class as a schema definition. It maps our 'Save' class to a MongoDB collection of the same name,
 * but with an additional “s” at the end - so the final mongo collection name will be 'saves'.
 */
@Schema()
export class Save {
  @Prop({
    unique: true,
  })
  uuid: string;

  @Prop()
  userUuid: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  link: string;

  @Prop()
  img: string;

  @Prop()
  readMinute: number;

  @Prop({ type: Date, default: now() })
  createdAt: Date;

  @Prop({ type: Date, default: now() })
  updatedAt: Date;
}

// factory method to create schema
// to be init in module
export const SaveSchema = SchemaFactory.createForClass(Save);
