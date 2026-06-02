import { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import { Task } from '../../../domain/entities/task.entity';

export class ListTasksUseCase {
  constructor(private readonly repo: ITaskRepository) {}
  execute(userId: string): Promise<Task[]> { return this.repo.findAll(userId); }
}
