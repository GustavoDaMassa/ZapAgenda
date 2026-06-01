import { randomUUID } from 'crypto';

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly';
export type CreatedVia = 'whatsapp' | 'dashboard';

export interface CreateAppointmentInput {
  title: string;
  startTime: Date;
  categoryId: string;
  createdVia: CreatedVia;
  userId: string;
  description?: string;
  endTime?: Date;
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
}

export class Appointment {
  readonly id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  readonly categoryId: string;
  readonly isRecurring: boolean;
  readonly recurrenceRule: RecurrenceRule | null;
  isCancelled: boolean;
  readonly createdVia: CreatedVia;
  readonly userId: string;
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(
    id: string, title: string, description: string | null,
    startTime: Date, endTime: Date | null, categoryId: string,
    isRecurring: boolean, recurrenceRule: RecurrenceRule | null,
    isCancelled: boolean, createdVia: CreatedVia, userId: string,
    createdAt: Date, updatedAt: Date,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.startTime = startTime;
    this.endTime = endTime;
    this.categoryId = categoryId;
    this.isRecurring = isRecurring;
    this.recurrenceRule = recurrenceRule;
    this.isCancelled = isCancelled;
    this.createdVia = createdVia;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  private static validateTimes(startTime: Date, endTime?: Date | null): void {
    if (endTime && endTime <= startTime) throw new Error('endTime must be after startTime');
  }

  static create(input: CreateAppointmentInput): Appointment {
    if (!input.title?.trim()) throw new Error('title is required');
    if (input.isRecurring && !input.recurrenceRule)
      throw new Error('recurrenceRule is required when isRecurring is true');
    Appointment.validateTimes(input.startTime, input.endTime);

    const now = new Date();
    return new Appointment(
      randomUUID(), input.title, input.description ?? null,
      input.startTime, input.endTime ?? null, input.categoryId,
      input.isRecurring ?? false, input.recurrenceRule ?? null,
      false, input.createdVia, input.userId, now, now,
    );
  }

  static reconstitute(
    id: string, title: string, description: string | null,
    startTime: Date, endTime: Date | null, categoryId: string,
    isRecurring: boolean, recurrenceRule: RecurrenceRule | null,
    isCancelled: boolean, createdVia: CreatedVia, userId: string,
    createdAt: Date, updatedAt: Date,
  ): Appointment {
    return new Appointment(
      id, title, description, startTime, endTime, categoryId,
      isRecurring, recurrenceRule, isCancelled, createdVia, userId,
      createdAt, updatedAt,
    );
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  cancel(): void {
    this.isCancelled = true;
    this.updatedAt = new Date();
  }

  reschedule(startTime: Date, endTime?: Date | null): void {
    Appointment.validateTimes(startTime, endTime);
    this.startTime = startTime;
    this.endTime = endTime ?? null;
    this.updatedAt = new Date();
  }

  update(title: string, description: string | null, startTime: Date, endTime: Date | null, categoryId: string): void {
    if (!title?.trim()) throw new Error('title is required');
    Appointment.validateTimes(startTime, endTime);
    this.title = title;
    this.description = description;
    this.startTime = startTime;
    this.endTime = endTime;
    this.updatedAt = new Date();
  }
}
