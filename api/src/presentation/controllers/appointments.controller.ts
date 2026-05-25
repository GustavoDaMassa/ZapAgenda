import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ListAppointmentsUseCase } from '../../application/use-cases/appointment/list-appointments.use-case';
import { GetAppointmentUseCase } from '../../application/use-cases/appointment/get-appointment.use-case';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointment/create-appointment.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointment/update-appointment.use-case';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointment/cancel-appointment.use-case';
import { CreateAppointmentDto } from '../../application/dtos/appointment/create-appointment.dto';
import { UpdateAppointmentDto } from '../../application/dtos/appointment/update-appointment.dto';
import { FindAppointmentsQueryDto } from '../../application/dtos/appointment/find-appointments-query.dto';
import { Appointment } from '../../domain/entities/appointment.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(
    private readonly listUseCase: ListAppointmentsUseCase,
    private readonly getUseCase: GetAppointmentUseCase,
    private readonly createUseCase: CreateAppointmentUseCase,
    private readonly updateUseCase: UpdateAppointmentUseCase,
    private readonly cancelUseCase: CancelAppointmentUseCase,
  ) {}

  @Get()
  findAll(@Query() query: FindAppointmentsQueryDto): Promise<Appointment[]> {
    return this.listUseCase.execute(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Appointment> {
    return this.getUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAppointmentDto): Promise<Appointment> {
    return this.createUseCase.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.cancelUseCase.execute(id);
  }
}
