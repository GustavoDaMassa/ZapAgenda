import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { ListTasksUseCase } from '../../application/use-cases/task/list-tasks.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task.use-case';
import { Task } from '../../domain/entities/task.entity';
import { TaskNotFoundException } from '../../domain/exceptions/task-not-found.exception';

const USER_ID = 'user-1';
const makeTask = () => Task.create({ title: 'Comprar pão', userId: USER_ID });

const mockList = { execute: jest.fn() };
const mockCreate = { execute: jest.fn() };
const mockUpdate = { execute: jest.fn() };
const mockDelete = { execute: jest.fn() };

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: ListTasksUseCase, useValue: mockList },
        { provide: CreateTaskUseCase, useValue: mockCreate },
        { provide: UpdateTaskUseCase, useValue: mockUpdate },
        { provide: DeleteTaskUseCase, useValue: mockDelete },
      ],
    }).compile();
    controller = module.get(TasksController);
    jest.clearAllMocks();
  });

  it('GET / returns task list', async () => {
    mockList.execute.mockResolvedValue([makeTask()]);
    const result = await controller.findAll(USER_ID);
    expect(result).toHaveLength(1);
    expect(mockList.execute).toHaveBeenCalledWith(USER_ID);
  });

  it('POST / creates a task', async () => {
    const task = makeTask();
    mockCreate.execute.mockResolvedValue(task);
    const result = await controller.create({ title: 'Comprar pão' }, USER_ID);
    expect(result).toBe(task);
  });

  it('PATCH /:id updates task', async () => {
    const task = makeTask();
    mockUpdate.execute.mockResolvedValue(task);
    const result = await controller.update(task.id, { isDone: true }, USER_ID);
    expect(result).toBe(task);
  });

  it('PATCH /:id propagates TaskNotFoundException', async () => {
    mockUpdate.execute.mockRejectedValue(new TaskNotFoundException('ghost'));
    await expect(controller.update('ghost', { title: 'X' }, USER_ID))
      .rejects.toBeInstanceOf(TaskNotFoundException);
  });

  it('DELETE /:id removes task', async () => {
    mockDelete.execute.mockResolvedValue(undefined);
    await expect(controller.remove('id', USER_ID)).resolves.toBeUndefined();
  });
});
