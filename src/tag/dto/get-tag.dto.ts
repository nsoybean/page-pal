import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';

import { ITagDoc, IListTags } from '../interfaces/tag.interface';

/**
 * Dto to perform class validation: https://docs.nestjs.com/pipes#class-validator
 */
export class ListTagResponseDto {
  @Expose()
  total_records: number;

  @Expose()
  // link: https://github.com/typestack/class-transformer#working-with-nested-objects:~:text=lastName%3A%20%27Khudoiberdiev%27%0A//%20%7D-,Working,-with%20nested%20objects
  @Type(() => GetTagResponseDto)
  data: GetTagResponseDto[];

  static convertToDto(listData: IListTags): ListTagResponseDto {
    const dto = new ListTagResponseDto();
    dto.total_records = listData.total_records;
    dto.data = plainToInstance(GetTagResponseDto, listData.data);

    return dto;
  }
}

export class GetTagResponseDto {
  @Exclude()
  _id: string;

  @Exclude()
  __v: string;

  @Exclude()
  userId: string;

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Exclude()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static convertToDto(Tag: ITagDoc): GetTagResponseDto {
    const dto = plainToInstance(GetTagResponseDto, Tag.toObject());
    return dto;
  }
}
