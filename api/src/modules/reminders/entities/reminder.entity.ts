import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ReminderStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

interface CreateReminderProps {
  appointmentId: string;
  minutesBefore: number;
  scheduledFor: Date;
}

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appointment_id' })
  appointmentId: string;

  @Column({ name: 'minutes_before', type: 'int' })
  minutesBefore: number;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @Column({ name: 'scheduled_for', type: 'timestamptz' })
  scheduledFor: Date;

  @Column({ name: 'sent_at', nullable: true, type: 'timestamptz' })
  sentAt: Date | null;

  static create(props: CreateReminderProps): Reminder {
    const reminder = new Reminder();
    reminder.appointmentId = props.appointmentId;
    reminder.minutesBefore = props.minutesBefore;
    reminder.scheduledFor = props.scheduledFor;
    reminder.status = ReminderStatus.PENDING;
    reminder.sentAt = null;
    return reminder;
  }

  markAsSent(): void {
    this.status = ReminderStatus.SENT;
    this.sentAt = new Date();
  }

  markAsFailed(): void {
    this.status = ReminderStatus.FAILED;
  }
}
