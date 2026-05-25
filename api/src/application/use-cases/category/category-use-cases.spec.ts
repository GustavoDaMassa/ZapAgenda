import { ListCategoriesUseCase } from './list-categories.use-case';
import { CreateCategoryUseCase } from './create-category.use-case';
import { UpdateCategoryUseCase } from './update-category.use-case';
import { DeleteCategoryUseCase } from './delete-category.use-case';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { ForbiddenException } from '../../../domain/exceptions/forbidden.exception';

const makeCategory = (isSystem = false) =>
  isSystem
    ? Category.createSystem('Trabalho', '#FF0000')
    : Category.create('Custom', '#112233');

const mockRepo = (): jest.Mocked<ICategoryRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ListCategoriesUseCase', () => {
  it('returns all categories', async () => {
    const repo = mockRepo();
    repo.findAll.mockResolvedValue([makeCategory()]);
    const result = await new ListCategoriesUseCase(repo).execute();
    expect(result).toHaveLength(1);
  });
});

describe('CreateCategoryUseCase', () => {
  it('creates and persists a category', async () => {
    const repo = mockRepo();
    const result = await new CreateCategoryUseCase(repo).execute({
      name: 'Estudos',
      color: '#AABBCC',
    });
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Estudos');
  });
});

describe('UpdateCategoryUseCase', () => {
  it('updates name and color', async () => {
    const repo = mockRepo();
    const cat = makeCategory();
    repo.findById.mockResolvedValue(cat);
    const result = await new UpdateCategoryUseCase(repo).execute(cat.id, {
      name: 'Novo Nome',
      color: '#FFFFFF',
    });
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Novo Nome');
  });

  it('throws NotFoundException when category does not exist', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    await expect(
      new UpdateCategoryUseCase(repo).execute('ghost-id', { name: 'X', color: '#FFFFFF' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('DeleteCategoryUseCase', () => {
  it('deletes a non-system category', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeCategory(false));
    await new DeleteCategoryUseCase(repo).execute('some-id');
    expect(repo.delete).toHaveBeenCalled();
  });

  it('throws NotFoundException when category does not exist', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    await expect(
      new DeleteCategoryUseCase(repo).execute('ghost-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ForbiddenException when deleting a system category', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeCategory(true));
    await expect(
      new DeleteCategoryUseCase(repo).execute('sys-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
