import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';
import { TaskOrmEntity } from './task.orm-entity';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(@InjectRepository(TaskOrmEntity) private readonly repo: Repository<TaskOrmEntity>) {}

  async findAll(userId: string): Promise<Task[]> {
    const rows = await this.repo.find({
      where: { userId },
      order: { isDone: 'ASC', createdAt: 'DESC' },
    });
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<Task | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async save(task: Task): Promise<void> {
    await this.repo.save({
      id: task.id, title: task.title, description: task.description,
      isDone: task.isDone, userId: task.userId,
    });
  }

  async delete(id: string): Promise<void> { await this.repo.delete(id); }

  private toDomain(row: TaskOrmEntity): Task {
    return Task.reconstitute(row.id, row.title, row.description, row.isDone, row.userId, row.createdAt, row.updatedAt);
  }
}
