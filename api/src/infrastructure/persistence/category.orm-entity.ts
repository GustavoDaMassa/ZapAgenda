import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('categories')
export class CategoryOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column({ name: 'default_reminder_minutes', nullable: true, type: 'int' })
  defaultReminderMinutes: number | null;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;
}
