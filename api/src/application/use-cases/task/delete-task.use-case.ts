import { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import { TaskNotFoundException } from '../../../domain/exceptions/task-not-found.exception';

export class DeleteTaskUseCase {
  constructor(private readonly repo: ITaskRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const task = await this.repo.findById(id);
    if (!task || !task.isOwnedBy(userId)) throw new TaskNotFoundException(id);
    await this.repo.delete(id);
  }
}
