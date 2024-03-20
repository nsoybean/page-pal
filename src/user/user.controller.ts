import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { GetUserResponseDto } from './dto/index';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async me() {
    const user = await this.userService.findMe();
    const parsed = GetUserResponseDto.convertToDto(user);
    // return user;
    return parsed;
  }
}
