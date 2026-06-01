import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { ForbiddenException } from '../../../domain/exceptions/forbidden.exception';

export class DeleteCategoryUseCase {
  constructor(private readonly repo: ICategoryRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundException('Category', id);
    if (!category.isDeletable()) throw new ForbiddenException('System categories cannot be deleted');
    if (!category.isOwnedBy(userId)) throw new ForbiddenException('You do not own this category');

    await this.repo.delete(id);
  }
}
