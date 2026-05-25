import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { ListCategoriesUseCase } from '../../application/use-cases/category/list-categories.use-case';
import { CreateCategoryUseCase } from '../../application/use-cases/category/create-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/category/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/category/delete-category.use-case';
import { Category } from '../../domain/entities/category.entity';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';

const makeCategory = () => Category.create('Saúde', '#FF0000');

const mockList = { execute: jest.fn() };
const mockCreate = { execute: jest.fn() };
const mockUpdate = { execute: jest.fn() };
const mockDelete = { execute: jest.fn() };

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: ListCategoriesUseCase, useValue: mockList },
        { provide: CreateCategoryUseCase, useValue: mockCreate },
        { provide: UpdateCategoryUseCase, useValue: mockUpdate },
        { provide: DeleteCategoryUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get(CategoriesController);
    jest.clearAllMocks();
  });

  it('GET / returns list of categories', async () => {
    mockList.execute.mockResolvedValue([makeCategory()]);
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
  });

  it('POST / creates a category', async () => {
    const cat = makeCategory();
    mockCreate.execute.mockResolvedValue(cat);
    const result = await controller.create({ name: 'Saúde', color: '#FF0000' });
    expect(result).toBe(cat);
  });

  it('PATCH /:id updates a category', async () => {
    const cat = makeCategory();
    mockUpdate.execute.mockResolvedValue(cat);
    const result = await controller.update(cat.id, { name: 'Novo', color: '#FFFFFF' });
    expect(result).toBe(cat);
  });

  it('PATCH /:id propagates NotFoundException', async () => {
    mockUpdate.execute.mockRejectedValue(new NotFoundException('Category', 'ghost'));
    await expect(controller.update('ghost', { name: 'X', color: '#FFFFFF' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('DELETE /:id deletes a category', async () => {
    mockDelete.execute.mockResolvedValue(undefined);
    await expect(controller.remove('some-id')).resolves.toBeUndefined();
  });

  it('DELETE /:id propagates NotFoundException', async () => {
    mockDelete.execute.mockRejectedValue(new NotFoundException('Category', 'ghost'));
    await expect(controller.remove('ghost')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('DELETE /:id propagates ForbiddenException for system category', async () => {
    mockDelete.execute.mockRejectedValue(new ForbiddenException('cannot delete system category'));
    await expect(controller.remove('sys-id')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
