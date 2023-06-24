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
  userId: string;

  @Expose()
  id: string;

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
  userId: string;

  @Expose()
  id: string;

  @Expose()
  link: string;

  @Expose()
  title: string;

  @Expose()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
