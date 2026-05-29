import { IReminderRepository } from '../../../domain/repositories/reminder.repository.interface';
import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { IReminderQueue } from '../../../domain/queue/reminder-queue.interface';
import { Reminder } from '../../../domain/entities/reminder.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { CreateReminderDto } from '../../dtos/reminder/create-reminder.dto';

export class CreateReminderUseCase {
  constructor(
    private readonly reminderRepo: IReminderRepository,
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly reminderQueue: IReminderQueue | null = null,
  ) {}

  async execute(appointmentId: string, dto: CreateReminderDto): Promise<Reminder> {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) throw new NotFoundException('Appointment', appointmentId);

    const scheduledFor = new Date(dto.scheduledFor);
    const reminder = Reminder.create({ appointmentId, minutesBefore: dto.minutesBefore, scheduledFor });

    await this.reminderRepo.save(reminder);

    if (this.reminderQueue) {
      const delayMs = scheduledFor.getTime() - Date.now();
      if (delayMs > 0) {
        await this.reminderQueue.schedule(
          { reminderId: reminder.id, appointmentId, appointmentTitle: appointment.title, scheduledFor: scheduledFor.toISOString() },
          delayMs,
        );
      }
    }

    return reminder;
  }
}
