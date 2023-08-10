import { Document } from 'mongoose';

/**
 * As the developer are responsible for ensuring that your document interface lines up with your Mongoose schema.
 * For example, Mongoose won't report an error if email is required in your Mongoose schema but optional in your document interface
 * Link: https://mongoosejs.com/docs/typescript.html
 */
export interface IUser extends Document {
  readonly id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  password: string;
  lastSignIn: Date;
}
