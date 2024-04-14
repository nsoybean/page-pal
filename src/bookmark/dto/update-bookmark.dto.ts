import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class UpdateBookmarkNoteDto {
  @IsString()
  @IsNotEmpty()
  note: string;
}
