import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CategoryOrmEntity } from './category.orm-entity';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {}

  async findAll(): Promise<Category[]> {
    const rows = await this.repo.find();
    return rows.map((r) =>
      Category.reconstitute(r.id, r.name, r.color, r.defaultReminderMinutes, r.isSystem),
    );
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.repo.findOneBy({ id });
    return row
      ? Category.reconstitute(row.id, row.name, row.color, row.defaultReminderMinutes, row.isSystem)
      : null;
  }

  async save(category: Category): Promise<void> {
    await this.repo.save({
      id: category.id,
      name: category.name,
      color: category.color,
      defaultReminderMinutes: category.defaultReminderMinutes,
      isSystem: category.isSystem,
    });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
