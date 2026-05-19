import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RecurrenceRule {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum CreatedVia {
  WHATSAPP = 'whatsapp',
  DASHBOARD = 'dashboard',
}

interface CreateAppointmentProps {
  title: string;
  startTime: Date;
  categoryId: string;
  description?: string;
  endTime?: Date;
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  createdVia?: CreatedVia;
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', nullable: true, type: 'timestamptz' })
  endTime: Date | null;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({
    name: 'recurrence_rule',
    type: 'enum',
    enum: RecurrenceRule,
    nullable: true,
  })
  recurrenceRule: RecurrenceRule | null;

  @Column({ name: 'is_cancelled', default: false })
  isCancelled: boolean;

  @Column({
    name: 'created_via',
    type: 'enum',
    enum: CreatedVia,
    default: CreatedVia.WHATSAPP,
  })
  createdVia: CreatedVia;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  static create(props: CreateAppointmentProps): Appointment {
    const appointment = new Appointment();
    appointment.title = props.title;
    appointment.startTime = props.startTime;
    appointment.categoryId = props.categoryId;
    appointment.description = props.description ?? null;
    appointment.endTime = props.endTime ?? null;
    appointment.isRecurring = props.isRecurring ?? false;
    appointment.recurrenceRule = props.recurrenceRule ?? null;
    appointment.isCancelled = false;
    appointment.createdVia = props.createdVia ?? CreatedVia.WHATSAPP;
    return appointment;
  }

  cancel(): void {
    this.isCancelled = true;
  }
}
