import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { AppointmentOrmEntity } from './appointment.orm-entity';

@Entity('reminders')
export class ReminderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'appointment_id', type: 'uuid' })
  appointmentId: string;

  @ManyToOne(() => AppointmentOrmEntity)
  appointment: AppointmentOrmEntity;

  @Column({ name: 'minutes_before', type: 'int' })
  minutesBefore: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ name: 'scheduled_for', type: 'timestamptz' })
  scheduledFor: Date;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date | null;
}
