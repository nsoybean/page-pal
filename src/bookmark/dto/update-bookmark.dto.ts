import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateBookmarkDto } from './create-bookmark.dto';

export class UpdateBookmarkDto extends PartialType(CreateBookmarkDto) {}

export class UpdateBookmarkNoteDto {
  @IsString()
  @IsNotEmpty()
  note: string;
}
