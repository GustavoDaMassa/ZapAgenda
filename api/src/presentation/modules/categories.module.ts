import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from '../controllers/categories.controller';
import { ListCategoriesUseCase } from '../../application/use-cases/category/list-categories.use-case';
import { CreateCategoryUseCase } from '../../application/use-cases/category/create-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/category/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/category/delete-category.use-case';
import { CategoryRepository } from '../../infrastructure/persistence/category.repository';
import { CategoryOrmEntity } from '../../infrastructure/persistence/category.orm-entity';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryOrmEntity]), AuthModule],
  controllers: [CategoriesController],
  providers: [
    { provide: CATEGORY_REPOSITORY, useClass: CategoryRepository },
    {
      provide: ListCategoriesUseCase,
      useFactory: (repo: CategoryRepository) => new ListCategoriesUseCase(repo),
      inject: [CATEGORY_REPOSITORY],
    },
    {
      provide: CreateCategoryUseCase,
      useFactory: (repo: CategoryRepository) => new CreateCategoryUseCase(repo),
      inject: [CATEGORY_REPOSITORY],
    },
    {
      provide: UpdateCategoryUseCase,
      useFactory: (repo: CategoryRepository) => new UpdateCategoryUseCase(repo),
      inject: [CATEGORY_REPOSITORY],
    },
    {
      provide: DeleteCategoryUseCase,
      useFactory: (repo: CategoryRepository) => new DeleteCategoryUseCase(repo),
      inject: [CATEGORY_REPOSITORY],
    },
  ],
})
export class CategoriesModule {}
