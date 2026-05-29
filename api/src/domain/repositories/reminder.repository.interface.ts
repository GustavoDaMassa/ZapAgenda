import { Reminder } from '../entities/reminder.entity';

export interface IReminderRepository {
  findByAppointment(appointmentId: string): Promise<Reminder[]>;
  findById(id: string): Promise<Reminder | null>;
  save(reminder: Reminder): Promise<void>;
  delete(id: string): Promise<void>;
}

export const REMINDER_REPOSITORY = Symbol('IReminderRepository');
