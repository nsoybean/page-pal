import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SaveDocument = HydratedDocument<Save>;

/**
 * The @Schema() decorator marks a class as a schema definition. It maps our 'Save' class to a MongoDB collection of the same name,
 * but with an additional “s” at the end - so the final mongo collection name will be 'saves'.
 */
@Schema()
export class Save {
  @Prop()
  title: string;

  @Prop()
  img: string;

  @Prop()
  readMinute: number;
}

export const SaveSchema = SchemaFactory.createForClass(Save);
