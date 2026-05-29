import { randomUUID } from 'crypto';

export type ReminderStatus = 'pending' | 'sent' | 'failed';

export interface CreateReminderInput {
  appointmentId: string;
  minutesBefore: number;
  scheduledFor: Date;
}

export class Reminder {
  readonly id: string;
  readonly appointmentId: string;
  readonly minutesBefore: number;
  status: ReminderStatus;
  readonly scheduledFor: Date;
  sentAt: Date | null;

  private constructor(
    id: string,
    appointmentId: string,
    minutesBefore: number,
    status: ReminderStatus,
    scheduledFor: Date,
    sentAt: Date | null,
  ) {
    this.id = id;
    this.appointmentId = appointmentId;
    this.minutesBefore = minutesBefore;
    this.status = status;
    this.scheduledFor = scheduledFor;
    this.sentAt = sentAt;
  }

  static create(input: CreateReminderInput): Reminder {
    if (input.minutesBefore <= 0) throw new Error('minutesBefore must be positive');
    return new Reminder(randomUUID(), input.appointmentId, input.minutesBefore, 'pending', input.scheduledFor, null);
  }

  static reconstitute(
    id: string,
    appointmentId: string,
    minutesBefore: number,
    status: ReminderStatus,
    scheduledFor: Date,
    sentAt: Date | null,
  ): Reminder {
    return new Reminder(id, appointmentId, minutesBefore, status, scheduledFor, sentAt);
  }

  markAsSent(): void {
    this.status = 'sent';
    this.sentAt = new Date();
  }

  markAsFailed(): void {
    this.status = 'failed';
  }
}
