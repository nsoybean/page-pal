import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop({ unique: true })
  id: string;

  @Prop({ lowercase: true, unique: true }) // TODO: consider if email should be unique (can sign up via email/ social login)
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  picture: string;

  @Prop({ select: false })
  password: string;
}

export type UserDocument = User & Document;

// factory method to create schema
// to be init in module
export const UserSchema = SchemaFactory.createForClass(User);
