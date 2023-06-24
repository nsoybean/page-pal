import { IsNotEmpty, IsString } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

export class CreateSaveRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly link: string;
}

export class GetSaveResponseDto {
  @Exclude()
  _id: string;

  @Exclude()
  __v: string;

  @Exclude()
  userUuid: string;

  @Expose()
  uuid: string;

  @Expose()
  link: string;

  @Expose()
  title: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class CreateSaveResponseDto {
  @Exclude()
  _id: string;

  @Exclude()
  __v: string;

  @Exclude()
  userUuid: string;

  @Expose()
  uuid: string;

  @Exclude()
  link: string;

  @Exclude()
  title: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
