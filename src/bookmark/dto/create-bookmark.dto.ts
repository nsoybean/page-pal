import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { IBookmarkDoc } from '../interfaces/bookmark.interface';

/**
 * Dto to perform class validation: https://docs.nestjs.com/pipes#class-validator
 */
export class CreateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  link: string;
}

export class CreateBookmarkResponseDto {
  @Exclude()
  _id: string;

  @Exclude()
  __v: string;

  @Exclude()
  userId: string;

  @Expose()
  id: string;

  @Expose()
  link: string;

  @Expose()
  domain: string;

  @Exclude()
  type: string;

  @Expose()
  color: string;

  @Expose()
  title: string;

  @Expose()
  image: string;

  @Expose()
  state: string;

  @Expose()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  note: Date;

  @Expose()
  description: string;

  static convertToDto(
    createdBookmark: IBookmarkDoc,
  ): CreateBookmarkResponseDto {
    const dto = plainToInstance(
      CreateBookmarkResponseDto,
      createdBookmark.toObject(),
    );
    return dto;
  }
}
