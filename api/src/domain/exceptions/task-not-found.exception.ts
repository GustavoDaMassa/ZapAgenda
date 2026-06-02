import { NotFoundException } from './not-found.exception';

export class TaskNotFoundException extends NotFoundException {
  constructor(id: string) { super('Task', id); }
}
