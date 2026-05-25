import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';

export interface UpdateCategoryInput {
  name: string;
  color: string;
  defaultReminderMinutes?: number | null;
}

export class UpdateCategoryUseCase {
  constructor(private readonly repo: ICategoryRepository) {}

  async execute(id: string, input: UpdateCategoryInput): Promise<Category> {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundException('Category', id);

    category.update(input.name, input.color, input.defaultReminderMinutes);
    await this.repo.save(category);
    return category;
  }
}
