import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { ForbiddenException } from '../../../domain/exceptions/forbidden.exception';

export interface UpdateCategoryInput {
  name: string;
  color: string;
  defaultReminderMinutes?: number | null;
}

export class UpdateCategoryUseCase {
  constructor(private readonly repo: ICategoryRepository) {}

  async execute(id: string, input: UpdateCategoryInput, userId: string): Promise<Category> {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundException('Category', id);
    if (category.isSystem) throw new ForbiddenException('System categories cannot be modified');
    if (!category.isOwnedBy(userId)) throw new ForbiddenException('You do not own this category');

    category.update(input.name, input.color, input.defaultReminderMinutes);
    await this.repo.save(category);
    return category;
  }
}
