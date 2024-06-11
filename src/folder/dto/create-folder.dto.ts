import { IsMongoId, IsNotEmpty, IsString, isMongoId } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  parentFolderId: string;

  @IsString()
  @IsNotEmpty()
  folderName: string;
}
