import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from '../controllers/appointments.controller';
import { ListAppointmentsUseCase } from '../../application/use-cases/appointment/list-appointments.use-case';
import { GetAppointmentUseCase } from '../../application/use-cases/appointment/get-appointment.use-case';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointment/create-appointment.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointment/update-appointment.use-case';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointment/cancel-appointment.use-case';
import { AppointmentRepository } from '../../infrastructure/persistence/appointment.repository';
import { AppointmentOrmEntity } from '../../infrastructure/persistence/appointment.orm-entity';
import { APPOINTMENT_REPOSITORY } from '../../domain/repositories/appointment.repository.interface';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentOrmEntity]), AuthModule],
  controllers: [AppointmentsController],
  providers: [
    { provide: APPOINTMENT_REPOSITORY, useClass: AppointmentRepository },
    {
      provide: ListAppointmentsUseCase,
      useFactory: (repo: AppointmentRepository) => new ListAppointmentsUseCase(repo),
      inject: [APPOINTMENT_REPOSITORY],
    },
    {
      provide: GetAppointmentUseCase,
      useFactory: (repo: AppointmentRepository) => new GetAppointmentUseCase(repo),
      inject: [APPOINTMENT_REPOSITORY],
    },
    {
      provide: CreateAppointmentUseCase,
      useFactory: (repo: AppointmentRepository) => new CreateAppointmentUseCase(repo),
      inject: [APPOINTMENT_REPOSITORY],
    },
    {
      provide: UpdateAppointmentUseCase,
      useFactory: (repo: AppointmentRepository) => new UpdateAppointmentUseCase(repo),
      inject: [APPOINTMENT_REPOSITORY],
    },
    {
      provide: CancelAppointmentUseCase,
      useFactory: (repo: AppointmentRepository) => new CancelAppointmentUseCase(repo),
      inject: [APPOINTMENT_REPOSITORY],
    },
  ],
  exports: [APPOINTMENT_REPOSITORY],
})
export class AppointmentsModule {}
