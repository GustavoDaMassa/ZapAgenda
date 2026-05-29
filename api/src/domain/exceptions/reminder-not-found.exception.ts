import { NotFoundException } from './not-found.exception';

export class ReminderNotFoundException extends NotFoundException {
  constructor(id: string) {
    super('Reminder', id);
  }
}
