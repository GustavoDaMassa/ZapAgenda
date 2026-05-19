import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';

const mockCategory = (): Category =>
  Category.create({ name: 'Work', color: '#FF5733' });

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: jest.Mocked<Repository<Category>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CategoriesService);
    repo = module.get(getRepositoryToken(Category));
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = [mockCategory()];
      repo.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toEqual(categories);
      expect(repo.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a category when found', async () => {
      const category = mockCategory();
      repo.findOne.mockResolvedValue(category);

      const result = await service.findOne('uuid');

      expect(result).toEqual(category);
    });

    it('should throw CategoryNotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        CategoryNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should save and return a new category', async () => {
      const dto = { name: 'Health', color: '#00FF00' };
      const saved = Category.create(dto);
      repo.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('Health');
    });
  });

  describe('update', () => {
    it('should update and return the category', async () => {
      const category = mockCategory();
      repo.findOne.mockResolvedValue(category);
      repo.save.mockResolvedValue({ ...category, name: 'Updated' });

      const result = await service.update('uuid', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw CategoryNotFoundException when category does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('missing-id', { name: 'X' })).rejects.toThrow(
        CategoryNotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a non-system category', async () => {
      const category = mockCategory();
      repo.findOne.mockResolvedValue(category);

      await service.remove('uuid');

      expect(repo.delete).toHaveBeenCalledWith('uuid');
    });

    it('should throw when trying to delete a system category', async () => {
      const systemCategory = Category.create({
        name: 'Personal',
        color: '#AAAAAA',
        isSystem: true,
      });
      repo.findOne.mockResolvedValue(systemCategory);

      await expect(service.remove('uuid')).rejects.toThrow();
    });

    it('should throw CategoryNotFoundException when category does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        CategoryNotFoundException,
      );
    });
  });
});
