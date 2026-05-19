import { NotFoundException } from '../../../common/exceptions/not-found.exception';

export class CategoryNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Category with id ${id}`);
  }
}
