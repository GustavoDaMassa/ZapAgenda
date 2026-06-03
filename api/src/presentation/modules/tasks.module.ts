import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from '../controllers/tasks.controller';
import { ListTasksUseCase } from '../../application/use-cases/task/list-tasks.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task.use-case';
import { TaskRepository } from '../../infrastructure/persistence/task.repository';
import { TaskOrmEntity } from '../../infrastructure/persistence/task.orm-entity';
import { TASK_REPOSITORY } from '../../domain/repositories/task.repository.interface';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskOrmEntity]), AuthModule],
  controllers: [TasksController],
  providers: [
    { provide: TASK_REPOSITORY, useClass: TaskRepository },
    { provide: ListTasksUseCase, useFactory: (r: TaskRepository) => new ListTasksUseCase(r), inject: [TASK_REPOSITORY] },
    { provide: CreateTaskUseCase, useFactory: (r: TaskRepository) => new CreateTaskUseCase(r), inject: [TASK_REPOSITORY] },
    { provide: UpdateTaskUseCase, useFactory: (r: TaskRepository) => new UpdateTaskUseCase(r), inject: [TASK_REPOSITORY] },
    { provide: DeleteTaskUseCase, useFactory: (r: TaskRepository) => new DeleteTaskUseCase(r), inject: [TASK_REPOSITORY] },
  ],
  exports: [TASK_REPOSITORY],
})
export class TasksModule {}
