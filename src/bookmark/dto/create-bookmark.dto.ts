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
  title: string;

  @Expose()
  image: string;

  @Expose()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deleted: boolean;

  @Exclude()
  archived: boolean;

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
