import { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import { Task } from '../../../domain/entities/task.entity';
import { TaskNotFoundException } from '../../../domain/exceptions/task-not-found.exception';

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  isDone?: boolean;
}

export class UpdateTaskUseCase {
  constructor(private readonly repo: ITaskRepository) {}

  async execute(id: string, input: UpdateTaskInput, userId: string): Promise<Task> {
    const task = await this.repo.findById(id);
    if (!task || !task.isOwnedBy(userId)) throw new TaskNotFoundException(id);

    if (input.isDone === true) task.complete();
    else if (input.isDone === false) task.reopen();

    if (input.title !== undefined) task.update(input.title, input.description ?? task.description);

    await this.repo.save(task);
    return task;
  }
}
