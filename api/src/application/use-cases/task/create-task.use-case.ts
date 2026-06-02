import { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import { Task, CreateTaskInput } from '../../../domain/entities/task.entity';

export class CreateTaskUseCase {
  constructor(private readonly repo: ITaskRepository) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    const task = Task.create(input);
    await this.repo.save(task);
    return task;
  }
}
