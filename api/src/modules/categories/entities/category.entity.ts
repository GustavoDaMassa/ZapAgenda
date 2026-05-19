import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

interface CreateCategoryProps {
  name: string;
  color: string;
  isSystem?: boolean;
  defaultReminderMinutes?: number;
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column({ name: 'default_reminder_minutes', nullable: true, type: 'int' })
  defaultReminderMinutes: number | null;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  static create(props: CreateCategoryProps): Category {
    const category = new Category();
    category.name = props.name;
    category.color = props.color;
    category.isSystem = props.isSystem ?? false;
    category.defaultReminderMinutes = props.defaultReminderMinutes ?? null;
    return category;
  }
}
