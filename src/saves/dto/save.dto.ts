import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSaveRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly link: string;
}

export class CreateSaveResponseDto {
  // @IsString()
  // @IsNotEmpty()
  uuid: string;
}
