import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: jest.Mocked<CategoriesService>;

  const mockCategory = (): Category =>
    Category.create({ name: 'Work', color: '#FF5733' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CategoriesController);
    service = module.get(CategoriesService);
  });

  it('findAll should return array of categories', async () => {
    const categories = [mockCategory()];
    service.findAll.mockResolvedValue(categories);

    expect(await controller.findAll()).toEqual(categories);
  });

  it('findOne should return category by id', async () => {
    const category = mockCategory();
    service.findOne.mockResolvedValue(category);

    expect(await controller.findOne('uuid')).toEqual(category);
  });

  it('findOne should propagate CategoryNotFoundException as 404', async () => {
    service.findOne.mockRejectedValue(new CategoryNotFoundException('missing'));

    await expect(controller.findOne('missing')).rejects.toThrow(
      CategoryNotFoundException,
    );
  });

  it('create should return created category', async () => {
    const category = mockCategory();
    service.create.mockResolvedValue(category);

    expect(await controller.create({ name: 'Work', color: '#FF5733' })).toEqual(
      category,
    );
  });

  it('update should return updated category', async () => {
    const updated = { ...mockCategory(), name: 'Updated' };
    service.update.mockResolvedValue(updated as Category);

    expect(await controller.update('uuid', { name: 'Updated' })).toEqual(updated);
  });

  it('remove should call service.remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('uuid');

    expect(service.remove).toHaveBeenCalledWith('uuid');
  });
});
