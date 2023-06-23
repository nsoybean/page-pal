import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop({ lowercase: true, unique: true })
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ select: false })
  password: string;
}

export type UserDocument = User & Document;

// factory method to create schema
// to be init in module
export const UserSchema = SchemaFactory.createForClass(User);
