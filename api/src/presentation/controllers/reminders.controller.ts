import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUserId } from '../../infrastructure/auth/current-user.decorator';
import { ListRemindersUseCase } from '../../application/use-cases/reminder/list-reminders.use-case';
import { CreateReminderUseCase } from '../../application/use-cases/reminder/create-reminder.use-case';
import { DeleteReminderUseCase } from '../../application/use-cases/reminder/delete-reminder.use-case';
import { CreateReminderDto } from '../../application/dtos/reminder/create-reminder.dto';
import { Reminder } from '../../domain/entities/reminder.entity';

const REMINDER_EXAMPLE = {
  id: 'r1b2c3d4-e5f6-7890-abcd-ef1234567890',
  appointmentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  minutesBefore: 30,
  status: 'pending',
  scheduledFor: '2026-06-15T09:30:00.000Z',
  sentAt: null,
};

@ApiTags('reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments/:appointmentId/reminders')
export class RemindersController {
  constructor(
    private readonly listUseCase: ListRemindersUseCase,
    private readonly createUseCase: CreateReminderUseCase,
    private readonly deleteUseCase: DeleteReminderUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar lembretes do compromisso', description: 'Retorna todos os lembretes vinculados ao compromisso. Retorna 404 se o compromisso não pertencer ao usuário.' })
  @ApiParam({ name: 'appointmentId', description: 'UUID do compromisso', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Lista de lembretes', schema: { example: [REMINDER_EXAMPLE] } })
  @ApiResponse({ status: 404, description: 'Compromisso não encontrado' })
  findAll(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUserId() userId: string,
  ): Promise<Reminder[]> {
    return this.listUseCase.execute(appointmentId, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar lembrete',
    description: 'Cria um lembrete e o agenda na fila RabbitMQ via TTL. O lembrete será entregue via WhatsApp no horário definido em `scheduledFor`.',
  })
  @ApiParam({ name: 'appointmentId', description: 'UUID do compromisso', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 201, description: 'Lembrete criado e agendado', schema: { example: REMINDER_EXAMPLE } })
  @ApiResponse({ status: 400, description: 'Dados inválidos (minutesBefore deve ser positivo)' })
  @ApiResponse({ status: 404, description: 'Compromisso não encontrado' })
  create(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body() dto: CreateReminderDto,
    @CurrentUserId() userId: string,
  ): Promise<Reminder> {
    return this.createUseCase.execute(appointmentId, dto, userId);
  }

  @Delete(':reminderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover lembrete', description: 'Remove o lembrete do banco. Atenção: se já estiver publicado no RabbitMQ, o disparo não pode ser cancelado.' })
  @ApiParam({ name: 'appointmentId', description: 'UUID do compromisso', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'reminderId', description: 'UUID do lembrete', example: 'r1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 204, description: 'Lembrete removido' })
  @ApiResponse({ status: 404, description: 'Compromisso ou lembrete não encontrado' })
  remove(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    return this.deleteUseCase.execute(appointmentId, reminderId, userId);
  }
}
