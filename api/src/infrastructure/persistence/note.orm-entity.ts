import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Entity('notes')
export class NoteOrmEntity {
  @PrimaryColumn('uuid') id: string;
  @Column() title: string;
  @Column({ type: 'text' }) content: string;
  @Column({ name: 'is_pinned', default: false }) isPinned: boolean;
  @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
