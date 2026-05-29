import { IReminderRepository } from '../../../domain/repositories/reminder.repository.interface';
import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Reminder } from '../../../domain/entities/reminder.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { CreateReminderDto } from '../../dtos/reminder/create-reminder.dto';

export class CreateReminderUseCase {
  constructor(
    private readonly reminderRepo: IReminderRepository,
    private readonly appointmentRepo: IAppointmentRepository,
  ) {}

  async execute(appointmentId: string, dto: CreateReminderDto): Promise<Reminder> {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) throw new NotFoundException('Appointment', appointmentId);

    const reminder = Reminder.create({
      appointmentId,
      minutesBefore: dto.minutesBefore,
      scheduledFor: new Date(dto.scheduledFor),
    });

    await this.reminderRepo.save(reminder);
    return reminder;
  }
}
