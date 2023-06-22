import { Injectable } from '@nestjs/common';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService {
  // simply return obj
  googleLogin(user) {
    if (!user) {
      return 'Google authentication: User not found';
    }

    return {
      message: 'Google authentication: User information',
      user: user,
    };
  }
}
