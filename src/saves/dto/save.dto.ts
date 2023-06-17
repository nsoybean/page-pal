import { IsNotEmpty, IsString } from 'class-validator';

// // required for 'joi' package to perform object schema validation on incoming request
// const createSaveSchema = Joi.object({
//   name: Joi.string().required(),
//   age: Joi.number().required(),
//   breed: Joi.string().required(),
// });

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
