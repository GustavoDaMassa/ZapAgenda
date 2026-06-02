import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Entity('tasks')
export class TaskOrmEntity {
  @PrimaryColumn('uuid') id: string;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'is_done', default: false }) isDone: boolean;
  @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @ManyToOne(() => UserOrmEntity) user: UserOrmEntity;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
