import { ListCategoriesUseCase } from './list-categories.use-case';
import { CreateCategoryUseCase } from './create-category.use-case';
import { UpdateCategoryUseCase } from './update-category.use-case';
import { DeleteCategoryUseCase } from './delete-category.use-case';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { ForbiddenException } from '../../../domain/exceptions/forbidden.exception';

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';

const makeCategory = (isSystem = false) =>
  isSystem
    ? Category.createSystem('Trabalho', '#FF0000')
    : Category.create('Custom', '#112233', USER_ID);

const mockRepo = (): jest.Mocked<ICategoryRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ListCategoriesUseCase', () => {
  it('returns categories for the user', async () => {
    const repo = mockRepo();
    repo.findAll.mockResolvedValue([makeCategory()]);
    const result = await new ListCategoriesUseCase(repo).execute(USER_ID);
    expect(result).toHaveLength(1);
    expect(repo.findAll).toHaveBeenCalledWith(USER_ID);
  });
});

describe('CreateCategoryUseCase', () => {
  it('creates and persists a user-owned category', async () => {
    const repo = mockRepo();
    const result = await new CreateCategoryUseCase(repo).execute({ name: 'Estudos', color: '#AABBCC' }, USER_ID);
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Estudos');
    expect(result.userId).toBe(USER_ID);
  });
});

describe('UpdateCategoryUseCase', () => {
  it('updates name and color', async () => {
    const repo = mockRepo();
    const cat = makeCategory();
    repo.findById.mockResolvedValue(cat);
    const result = await new UpdateCategoryUseCase(repo).execute(cat.id, { name: 'Novo', color: '#FFFFFF' }, USER_ID);
    expect(result.name).toBe('Novo');
  });

  it('throws NotFoundException when category does not exist', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    await expect(
      new UpdateCategoryUseCase(repo).execute('ghost', { name: 'X', color: '#FFFFFF' }, USER_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ForbiddenException when updating a system category', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeCategory(true));
    await expect(
      new UpdateCategoryUseCase(repo).execute('sys', { name: 'X', color: '#FFFFFF' }, USER_ID),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws ForbiddenException when updating another user category', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeCategory(false));
    await expect(
      new UpdateCategoryUseCase(repo).execute('cat', { name: 'X', color: '#FFFFFF' }, OTHER_USER_ID),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('DeleteCategoryUseCase', () => {
  it('deletes a user-owned category', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeCategory(false));
    await new DeleteCategoryUseCase(repo).execute('some-id', USER_ID);
    expect(repo.delete).toHaveBeenCalled();
  });

  it('throws NotFoundException when category does not exist', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    await expect(new DeleteCategoryUseCase(repo).execute('ghost', USER_ID)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ForbiddenException for system category', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeCategory(true));
    await expect(new DeleteCategoryUseCase(repo).execute('sys', USER_ID)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws ForbiddenException when deleting another user category', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeCategory(false));
    await expect(new DeleteCategoryUseCase(repo).execute('cat', OTHER_USER_ID)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
