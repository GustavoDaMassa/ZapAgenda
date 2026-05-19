import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/exceptions/app.exception';

export class SystemCategoryException extends AppException {
  constructor() {
    super('System categories cannot be deleted', HttpStatus.CONFLICT);
  }
}
