import { IReminderRepository } from '../../../domain/repositories/reminder.repository.interface';
import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Reminder } from '../../../domain/entities/reminder.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';

export class ListRemindersUseCase {
  constructor(
    private readonly reminderRepo: IReminderRepository,
    private readonly appointmentRepo: IAppointmentRepository,
  ) {}

  async execute(appointmentId: string): Promise<Reminder[]> {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) throw new NotFoundException('Appointment', appointmentId);
    return this.reminderRepo.findByAppointment(appointmentId);
  }
}
