import { ListTasksUseCase } from './list-tasks.use-case';
import { CreateTaskUseCase } from './create-task.use-case';
import { UpdateTaskUseCase } from './update-task.use-case';
import { DeleteTaskUseCase } from './delete-task.use-case';
import { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import { Task } from '../../../domain/entities/task.entity';
import { TaskNotFoundException } from '../../../domain/exceptions/task-not-found.exception';

const USER_ID = 'user-1';
const OTHER = 'user-2';

const makeTask = () => Task.create({ title: 'Comprar pão', userId: USER_ID });

const mockRepo = (): jest.Mocked<ITaskRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ListTasksUseCase', () => {
  it('returns tasks for the user — pending first', async () => {
    const repo = mockRepo();
    repo.findAll.mockResolvedValue([makeTask()]);
    const result = await new ListTasksUseCase(repo).execute(USER_ID);
    expect(result).toHaveLength(1);
    expect(repo.findAll).toHaveBeenCalledWith(USER_ID);
  });
});

describe('CreateTaskUseCase', () => {
  it('creates and persists a task', async () => {
    const repo = mockRepo();
    const result = await new CreateTaskUseCase(repo).execute({ title: 'Estudar', userId: USER_ID });
    expect(repo.save).toHaveBeenCalled();
    expect(result.title).toBe('Estudar');
    expect(result.isDone).toBe(false);
  });
});

describe('UpdateTaskUseCase', () => {
  it('edits title and description', async () => {
    const repo = mockRepo();
    const task = makeTask();
    repo.findById.mockResolvedValue(task);
    const result = await new UpdateTaskUseCase(repo).execute(task.id, { title: 'Novo', description: 'desc' }, USER_ID);
    expect(result.title).toBe('Novo');
  });

  it('toggles isDone', async () => {
    const repo = mockRepo();
    const task = makeTask();
    repo.findById.mockResolvedValue(task);
    const result = await new UpdateTaskUseCase(repo).execute(task.id, { isDone: true }, USER_ID);
    expect(result.isDone).toBe(true);
  });

  it('throws TaskNotFoundException when not found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    await expect(new UpdateTaskUseCase(repo).execute('ghost', { title: 'X' }, USER_ID))
      .rejects.toBeInstanceOf(TaskNotFoundException);
  });

  it('throws TaskNotFoundException when owned by another user', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeTask());
    await expect(new UpdateTaskUseCase(repo).execute('id', { title: 'X' }, OTHER))
      .rejects.toBeInstanceOf(TaskNotFoundException);
  });
});

describe('DeleteTaskUseCase', () => {
  it('deletes an owned task', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeTask());
    await new DeleteTaskUseCase(repo).execute('id', USER_ID);
    expect(repo.delete).toHaveBeenCalled();
  });

  it('throws TaskNotFoundException when not found or not owned', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    await expect(new DeleteTaskUseCase(repo).execute('ghost', USER_ID))
      .rejects.toBeInstanceOf(TaskNotFoundException);
  });
});
