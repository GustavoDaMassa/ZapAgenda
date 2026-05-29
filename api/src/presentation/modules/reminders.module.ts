import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemindersController } from '../controllers/reminders.controller';
import { ListRemindersUseCase } from '../../application/use-cases/reminder/list-reminders.use-case';
import { CreateReminderUseCase } from '../../application/use-cases/reminder/create-reminder.use-case';
import { DeleteReminderUseCase } from '../../application/use-cases/reminder/delete-reminder.use-case';
import { ReminderRepository } from '../../infrastructure/persistence/reminder.repository';
import { ReminderOrmEntity } from '../../infrastructure/persistence/reminder.orm-entity';
import { REMINDER_REPOSITORY } from '../../domain/repositories/reminder.repository.interface';
import { REMINDER_QUEUE } from '../../domain/queue/reminder-queue.interface';
import { AppointmentsModule } from './appointments.module';
import { APPOINTMENT_REPOSITORY } from '../../domain/repositories/appointment.repository.interface';
import { AuthModule } from './auth.module';
import { QueueModule } from '../../infrastructure/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReminderOrmEntity]),
    AppointmentsModule,
    AuthModule,
    QueueModule,
  ],
  controllers: [RemindersController],
  providers: [
    { provide: REMINDER_REPOSITORY, useClass: ReminderRepository },
    {
      provide: ListRemindersUseCase,
      useFactory: (reminderRepo: ReminderRepository, apptRepo: any) =>
        new ListRemindersUseCase(reminderRepo, apptRepo),
      inject: [REMINDER_REPOSITORY, APPOINTMENT_REPOSITORY],
    },
    {
      provide: CreateReminderUseCase,
      useFactory: (reminderRepo: ReminderRepository, apptRepo: any, queue: any) =>
        new CreateReminderUseCase(reminderRepo, apptRepo, queue),
      inject: [REMINDER_REPOSITORY, APPOINTMENT_REPOSITORY, REMINDER_QUEUE],
    },
    {
      provide: DeleteReminderUseCase,
      useFactory: (reminderRepo: ReminderRepository, apptRepo: any) =>
        new DeleteReminderUseCase(reminderRepo, apptRepo),
      inject: [REMINDER_REPOSITORY, APPOINTMENT_REPOSITORY],
    },
  ],
})
export class RemindersModule {}
