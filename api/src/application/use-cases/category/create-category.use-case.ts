import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

export interface CreateCategoryInput {
  name: string;
  color: string;
  defaultReminderMinutes?: number;
}

export class CreateCategoryUseCase {
  constructor(private readonly repo: ICategoryRepository) {}

  async execute(input: CreateCategoryInput, userId: string): Promise<Category> {
    const category = Category.create(input.name, input.color, userId, input.defaultReminderMinutes);
    await this.repo.save(category);
    return category;
  }
}
