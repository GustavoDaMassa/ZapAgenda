import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUserId } from '../../infrastructure/auth/current-user.decorator';
import { ListCategoriesUseCase } from '../../application/use-cases/category/list-categories.use-case';
import { CreateCategoryUseCase } from '../../application/use-cases/category/create-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/category/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/category/delete-category.use-case';
import { CreateCategoryDto } from '../../application/dtos/category/create-category.dto';
import { UpdateCategoryDto } from '../../application/dtos/category/update-category.dto';
import { Category } from '../../domain/entities/category.entity';

const CATEGORY_EXAMPLE = {
  id: 'b2f1c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Reuniões',
  color: '#3498DB',
  defaultReminderMinutes: 30,
  isSystem: false,
  userId: 'aca55ca9-cebf-462a-8b4c-dc559e515a00',
};

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly listUseCase: ListCategoriesUseCase,
    private readonly createUseCase: CreateCategoryUseCase,
    private readonly updateUseCase: UpdateCategoryUseCase,
    private readonly deleteUseCase: DeleteCategoryUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias', description: 'Retorna as categorias do usuário mais as categorias do sistema (isSystem=true).' })
  @ApiResponse({ status: 200, description: 'Lista de categorias', schema: { example: [CATEGORY_EXAMPLE] } })
  findAll(@CurrentUserId() userId: string): Promise<Category[]> {
    return this.listUseCase.execute(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar categoria', description: 'Cria uma categoria personalizada vinculada ao usuário autenticado.' })
  @ApiResponse({ status: 201, description: 'Categoria criada', schema: { example: CATEGORY_EXAMPLE } })
  @ApiResponse({ status: 400, description: 'Dados inválidos (cor fora do formato hex, nome vazio, etc.)' })
  create(
    @Body() dto: CreateCategoryDto,
    @CurrentUserId() userId: string,
  ): Promise<Category> {
    return this.createUseCase.execute(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria', description: 'Atualiza nome, cor ou antecedência padrão. Não é permitido alterar categorias do sistema ou de outro usuário.' })
  @ApiParam({ name: 'id', description: 'UUID da categoria', example: 'b2f1c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada', schema: { example: CATEGORY_EXAMPLE } })
  @ApiResponse({ status: 403, description: 'Categoria do sistema ou de outro usuário' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUserId() userId: string,
  ): Promise<Category> {
    return this.updateUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar categoria', description: 'Remove uma categoria personalizada do usuário. Categorias do sistema não podem ser removidas.' })
  @ApiParam({ name: 'id', description: 'UUID da categoria', example: 'b2f1c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 204, description: 'Categoria removida com sucesso' })
  @ApiResponse({ status: 403, description: 'Categoria do sistema ou de outro usuário' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    return this.deleteUseCase.execute(id, userId);
  }
}
