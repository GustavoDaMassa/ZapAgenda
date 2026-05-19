import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { ReminderNotFoundException } from './exceptions/reminder-not-found.exception';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
  ) {}

  findByAppointment(appointmentId: string): Promise<Reminder[]> {
    return this.reminderRepository.find({ where: { appointmentId } });
  }

  create(appointmentId: string, dto: CreateReminderDto): Promise<Reminder> {
    const reminder = Reminder.create({ appointmentId, ...dto });
    return this.reminderRepository.save(reminder);
  }

  async remove(appointmentId: string, reminderId: string): Promise<void> {
    const reminder = await this.reminderRepository.findOne({
      where: { id: reminderId, appointmentId },
    });
    if (!reminder) throw new ReminderNotFoundException(reminderId);
    await this.reminderRepository.delete(reminderId);
  }
}
