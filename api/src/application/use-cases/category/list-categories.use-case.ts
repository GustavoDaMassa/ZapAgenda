import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

export class ListCategoriesUseCase {
  constructor(private readonly repo: ICategoryRepository) {}

  execute(userId: string): Promise<Category[]> {
    return this.repo.findAll(userId);
  }
}
