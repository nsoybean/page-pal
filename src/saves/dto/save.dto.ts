import { IsNotEmpty, IsString } from 'class-validator';
export class CreateSaveDto {
  @IsString()
  @IsNotEmpty()
  readonly link: string;
}
