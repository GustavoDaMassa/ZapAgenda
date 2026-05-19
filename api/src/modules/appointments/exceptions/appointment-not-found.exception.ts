import { NotFoundException } from '../../../common/exceptions/not-found.exception';

export class AppointmentNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Appointment with id ${id}`);
  }
}
