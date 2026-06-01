import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUserId } from '../../infrastructure/auth/current-user.decorator';
import { ListAppointmentsUseCase } from '../../application/use-cases/appointment/list-appointments.use-case';
import { GetAppointmentUseCase } from '../../application/use-cases/appointment/get-appointment.use-case';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointment/create-appointment.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointment/update-appointment.use-case';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointment/cancel-appointment.use-case';
import { CreateAppointmentDto } from '../../application/dtos/appointment/create-appointment.dto';
import { UpdateAppointmentDto } from '../../application/dtos/appointment/update-appointment.dto';
import { FindAppointmentsQueryDto } from '../../application/dtos/appointment/find-appointments-query.dto';
import { Appointment } from '../../domain/entities/appointment.entity';

const APPOINTMENT_EXAMPLE = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'Consulta médica',
  description: 'Levar exames anteriores',
  startTime: '2026-06-15T10:00:00.000Z',
  endTime: '2026-06-15T11:00:00.000Z',
  categoryId: 'b2f1c3d4-e5f6-7890-abcd-ef1234567890',
  userId: 'aca55ca9-cebf-462a-8b4c-dc559e515a00',
  isRecurring: false,
  recurrenceRule: null,
  isCancelled: false,
  createdVia: 'dashboard',
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly listUseCase: ListAppointmentsUseCase,
    private readonly getUseCase: GetAppointmentUseCase,
    private readonly createUseCase: CreateAppointmentUseCase,
    private readonly updateUseCase: UpdateAppointmentUseCase,
    private readonly cancelUseCase: CancelAppointmentUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar compromissos', description: 'Retorna os compromissos do usuário autenticado com filtros opcionais por período e categoria.' })
  @ApiQuery({ name: 'start', required: false, example: '2026-06-01T00:00:00.000Z', description: 'Data de início do filtro' })
  @ApiQuery({ name: 'end', required: false, example: '2026-06-30T23:59:59.000Z', description: 'Data de fim do filtro' })
  @ApiQuery({ name: 'categoryId', required: false, example: 'b2f1c3d4-e5f6-7890-abcd-ef1234567890', description: 'Filtrar por categoria' })
  @ApiResponse({ status: 200, description: 'Lista de compromissos', schema: { example: [APPOINTMENT_EXAMPLE] } })
  findAll(
    @Query() query: FindAppointmentsQueryDto,
    @CurrentUserId() userId: string,
  ): Promise<Appointment[]> {
    return this.listUseCase.execute(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar compromisso por ID' })
  @ApiParam({ name: 'id', description: 'UUID do compromisso', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Compromisso encontrado', schema: { example: APPOINTMENT_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'Compromisso não encontrado ou não pertence ao usuário' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
  ): Promise<Appointment> {
    return this.getUseCase.execute(id, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar compromisso', description: 'Cria um novo compromisso. Retorna 409 se houver conflito de horário com outro compromisso do usuário.' })
  @ApiResponse({ status: 201, description: 'Compromisso criado', schema: { example: APPOINTMENT_EXAMPLE } })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Conflito de horário — já existe um compromisso nesse intervalo' })
  create(
    @Body() dto: CreateAppointmentDto,
    @CurrentUserId() userId: string,
  ): Promise<Appointment> {
    return this.createUseCase.execute({ ...dto, userId, createdVia: 'dashboard' });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar compromisso', description: 'Atualiza título, horário, categoria ou descrição. Retorna 404 se não pertencer ao usuário.' })
  @ApiParam({ name: 'id', description: 'UUID do compromisso', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Compromisso atualizado', schema: { example: APPOINTMENT_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'Compromisso não encontrado' })
  @ApiResponse({ status: 409, description: 'Conflito de horário' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUserId() userId: string,
  ): Promise<Appointment> {
    return this.updateUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar compromisso', description: 'Marca o compromisso como cancelado (isCancelled=true). Não remove do banco.' })
  @ApiParam({ name: 'id', description: 'UUID do compromisso', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 204, description: 'Compromisso cancelado' })
  @ApiResponse({ status: 404, description: 'Compromisso não encontrado' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    return this.cancelUseCase.execute(id, userId);
  }
}
