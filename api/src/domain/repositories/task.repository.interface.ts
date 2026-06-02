import { Task } from '../entities/task.entity';

export interface ITaskRepository {
  findAll(userId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}

export const TASK_REPOSITORY = Symbol('ITaskRepository');
