import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetFolderData {
  @IsString()
  @IsOptional()
  folderId: string;
}
