import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateFolderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, {
    message: 'Folder name is too long',
  })
  name: string;
}
