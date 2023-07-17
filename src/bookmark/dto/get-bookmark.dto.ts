import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';

import { IBookmarkDoc, IListBookmarks } from '../interfaces/bookmark.interface';

/**
 * Dto to perform class validation: https://docs.nestjs.com/pipes#class-validator
 */
export class ListBookmarkResponseDto {
  @Expose()
  total_records: number;

  @Expose()
  // link: https://github.com/typestack/class-transformer#working-with-nested-objects:~:text=lastName%3A%20%27Khudoiberdiev%27%0A//%20%7D-,Working,-with%20nested%20objects
  @Type(() => GetBookmarkResponseDto)
  data: GetBookmarkResponseDto[];

  static convertToDto(listData: IListBookmarks): ListBookmarkResponseDto {
    const dto = new ListBookmarkResponseDto();
    dto.total_records = listData.total_records;
    dto.data = plainToInstance(GetBookmarkResponseDto, listData.data);

    return dto;
  }
}

export class GetBookmarkResponseDto {
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

  @Expose()
  archived: boolean;

  static convertToDto(bookmark: IBookmarkDoc): GetBookmarkResponseDto {
    const dto = plainToInstance(GetBookmarkResponseDto, bookmark.toObject());
    return dto;
  }
}
