import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ListRemindersUseCase } from '../../application/use-cases/reminder/list-reminders.use-case';
import { CreateReminderUseCase } from '../../application/use-cases/reminder/create-reminder.use-case';
import { DeleteReminderUseCase } from '../../application/use-cases/reminder/delete-reminder.use-case';
import { CreateReminderDto } from '../../application/dtos/reminder/create-reminder.dto';
import { Reminder } from '../../domain/entities/reminder.entity';

@Controller('appointments/:appointmentId/reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(
    private readonly listUseCase: ListRemindersUseCase,
    private readonly createUseCase: CreateReminderUseCase,
    private readonly deleteUseCase: DeleteReminderUseCase,
  ) {}

  @Get()
  findAll(@Param('appointmentId', ParseUUIDPipe) appointmentId: string): Promise<Reminder[]> {
    return this.listUseCase.execute(appointmentId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body() dto: CreateReminderDto,
  ): Promise<Reminder> {
    return this.createUseCase.execute(appointmentId, dto);
  }

  @Delete(':reminderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
  ): Promise<void> {
    return this.deleteUseCase.execute(appointmentId, reminderId);
  }
}
