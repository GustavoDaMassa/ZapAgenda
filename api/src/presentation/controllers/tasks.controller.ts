import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUserId } from '../../infrastructure/auth/current-user.decorator';
import { ListTasksUseCase } from '../../application/use-cases/task/list-tasks.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task.use-case';
import { CreateTaskDto } from '../../application/dtos/task/create-task.dto';
import { UpdateTaskDto } from '../../application/dtos/task/update-task.dto';
import { Task } from '../../domain/entities/task.entity';

const TASK_EXAMPLE = {
  id: 't1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'Comprar pão',
  description: 'Padaria do João',
  isDone: false,
  userId: 'aca55ca9-cebf-462a-8b4c-dc559e515a00',
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly listUseCase: ListTasksUseCase,
    private readonly createUseCase: CreateTaskUseCase,
    private readonly updateUseCase: UpdateTaskUseCase,
    private readonly deleteUseCase: DeleteTaskUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar tarefas', description: 'Retorna todas as tarefas do usuário. Pendentes primeiro, concluídas depois.' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas', schema: { example: [TASK_EXAMPLE] } })
  findAll(@CurrentUserId() userId: string): Promise<Task[]> {
    return this.listUseCase.execute(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada', schema: { example: TASK_EXAMPLE } })
  @ApiResponse({ status: 400, description: 'Título vazio' })
  create(@Body() dto: CreateTaskDto, @CurrentUserId() userId: string): Promise<Task> {
    return this.createUseCase.execute({ ...dto, userId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tarefa', description: 'Edita título/descrição ou altera isDone para concluir/reabrir.' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa', example: 't1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada', schema: { example: { ...TASK_EXAMPLE, isDone: true } } })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada ou não pertence ao usuário' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUserId() userId: string,
  ): Promise<Task> {
    return this.updateUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover tarefa' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa', example: 't1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 204, description: 'Tarefa removida' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUserId() userId: string): Promise<void> {
    return this.deleteUseCase.execute(id, userId);
  }
}
