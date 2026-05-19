import { NotFoundException } from '../../../common/exceptions/not-found.exception';

export class ReminderNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Reminder with id ${id}`);
  }
}
