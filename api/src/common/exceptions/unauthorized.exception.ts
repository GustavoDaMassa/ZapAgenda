import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class UnauthorizedException extends AppException {
  constructor(message = 'Invalid credentials') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
