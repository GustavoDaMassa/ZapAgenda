import { IReminderRepository } from '../../../domain/repositories/reminder.repository.interface';
import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { ReminderNotFoundException } from '../../../domain/exceptions/reminder-not-found.exception';

export class DeleteReminderUseCase {
  constructor(
    private readonly reminderRepo: IReminderRepository,
    private readonly appointmentRepo: IAppointmentRepository,
  ) {}

  async execute(appointmentId: string, reminderId: string, userId: string): Promise<void> {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment || !appointment.isOwnedBy(userId))
      throw new NotFoundException('Appointment', appointmentId);

    const reminder = await this.reminderRepo.findById(reminderId);
    if (!reminder) throw new ReminderNotFoundException(reminderId);

    await this.reminderRepo.delete(reminderId);
  }
}
