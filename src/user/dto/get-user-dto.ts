import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';
import { IUser } from '../interfaces/user.interface';

export class GetUserResponseDto {
  @Exclude()
  _id: string;

  @Exclude()
  __v: string;

  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  picture: string;

  @Expose()
  lastSignIn: Date;

  static convertToDto(userData: IUser): GetUserResponseDto {
    const dto = plainToInstance(GetUserResponseDto, userData);
    return dto;
  }
}
