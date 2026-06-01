import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Or, Repository } from 'typeorm';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CategoryOrmEntity } from './category.orm-entity';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    const rows = await this.repo.find({
      where: [{ userId }, { userId: IsNull() }],
    });
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async save(category: Category): Promise<void> {
    await this.repo.save({
      id: category.id,
      name: category.name,
      color: category.color,
      defaultReminderMinutes: category.defaultReminderMinutes,
      isSystem: category.isSystem,
      userId: category.userId,
    });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: CategoryOrmEntity): Category {
    return Category.reconstitute(
      row.id,
      row.name,
      row.color,
      row.defaultReminderMinutes,
      row.isSystem,
      row.userId,
    );
  }
}
