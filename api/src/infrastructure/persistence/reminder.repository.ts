import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IReminderRepository } from '../../domain/repositories/reminder.repository.interface';
import { Reminder, ReminderStatus } from '../../domain/entities/reminder.entity';
import { ReminderOrmEntity } from './reminder.orm-entity';

@Injectable()
export class ReminderRepository implements IReminderRepository {
  constructor(
    @InjectRepository(ReminderOrmEntity)
    private readonly repo: Repository<ReminderOrmEntity>,
  ) {}

  async findByAppointment(appointmentId: string): Promise<Reminder[]> {
    const rows = await this.repo.find({ where: { appointmentId } });
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<Reminder | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async save(reminder: Reminder): Promise<void> {
    await this.repo.save({
      id: reminder.id,
      appointmentId: reminder.appointmentId,
      minutesBefore: reminder.minutesBefore,
      status: reminder.status,
      scheduledFor: reminder.scheduledFor,
      sentAt: reminder.sentAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: ReminderOrmEntity): Reminder {
    return Reminder.reconstitute(
      row.id,
      row.appointmentId,
      row.minutesBefore,
      row.status as ReminderStatus,
      row.scheduledFor,
      row.sentAt,
    );
  }
}
