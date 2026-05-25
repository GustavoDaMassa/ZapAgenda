import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(404, message, 'Not Found');
  }
}
