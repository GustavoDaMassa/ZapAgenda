import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUserId } from '../../infrastructure/auth/current-user.decorator';
import { ListCategoriesUseCase } from '../../application/use-cases/category/list-categories.use-case';
import { CreateCategoryUseCase } from '../../application/use-cases/category/create-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/category/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/category/delete-category.use-case';
import { CreateCategoryDto } from '../../application/dtos/category/create-category.dto';
import { UpdateCategoryDto } from '../../application/dtos/category/update-category.dto';
import { Category } from '../../domain/entities/category.entity';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly listUseCase: ListCategoriesUseCase,
    private readonly createUseCase: CreateCategoryUseCase,
    private readonly updateUseCase: UpdateCategoryUseCase,
    private readonly deleteUseCase: DeleteCategoryUseCase,
  ) {}

  @Get()
  findAll(@CurrentUserId() userId: string): Promise<Category[]> {
    return this.listUseCase.execute(userId);
  }

  @Post()
  create(
    @Body() dto: CreateCategoryDto,
    @CurrentUserId() userId: string,
  ): Promise<Category> {
    return this.createUseCase.execute(dto, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUserId() userId: string,
  ): Promise<Category> {
    return this.updateUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    return this.deleteUseCase.execute(id, userId);
  }
}
