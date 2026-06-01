import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { BaileysService } from './baileys.service';
import { NlpClientService } from './nlp-client.service';
import { WhatsAppHandler } from './whatsapp-handler';
import { AppointmentsModule } from '../../presentation/modules/appointments.module';
import { RemindersModule } from '../../presentation/modules/reminders.module';
import { AuthModule } from '../../presentation/modules/auth.module';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { APPOINTMENT_REPOSITORY } from '../../domain/repositories/appointment.repository.interface';
import { ListAppointmentsUseCase } from '../../application/use-cases/appointment/list-appointments.use-case';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointment/create-appointment.use-case';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointment/cancel-appointment.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointment/update-appointment.use-case';
import { CreateReminderUseCase } from '../../application/use-cases/reminder/create-reminder.use-case';
import { REMINDER_REPOSITORY } from '../../domain/repositories/reminder.repository.interface';
import { REMINDER_QUEUE } from '../../domain/queue/reminder-queue.interface';
import { QueueModule } from '../queue/queue.module';
import { ReminderConsumerService } from '../queue/reminder-consumer.service';
import { ModuleRef } from '@nestjs/core';

@Module({
  imports: [AppointmentsModule, RemindersModule, AuthModule, QueueModule],
  providers: [
    BaileysService,
    NlpClientService,
    {
      provide: ListAppointmentsUseCase,
      useFactory: (repo: any) => new ListAppointmentsUseCase(repo),
      inject: [APPOINTMENT_REPOSITORY],
    },
    {
      provide: CreateAppointmentUseCase,
      useFactory: (repo: any) => new CreateAppointmentUseCase(repo),
      inject: [APPOINTMENT_REPOSITORY],
    },
    {
      provide: CancelAppointmentUseCase,
      useFactory: (repo: any) => new CancelAppointmentUseCase(repo),
      inject: [APPOINTMENT_REPOSITORY],
    },
    {
      provide: UpdateAppointmentUseCase,
      useFactory: (repo: any) => new UpdateAppointmentUseCase(repo),
      inject: [APPOINTMENT_REPOSITORY],
    },
    {
      provide: CreateReminderUseCase,
      useFactory: (reminderRepo: any, apptRepo: any, queue: any) =>
        new CreateReminderUseCase(reminderRepo, apptRepo, queue),
      inject: [REMINDER_REPOSITORY, APPOINTMENT_REPOSITORY, REMINDER_QUEUE],
    },
    {
      provide: WhatsAppHandler,
      useFactory: (
        baileys: BaileysService,
        nlp: NlpClientService,
        userRepo: any,
        list: ListAppointmentsUseCase,
        create: CreateAppointmentUseCase,
        cancel: CancelAppointmentUseCase,
        update: UpdateAppointmentUseCase,
        createReminder: CreateReminderUseCase,
      ) => new WhatsAppHandler(baileys, nlp, userRepo, list, create, cancel, update, createReminder),
      inject: [
        BaileysService, NlpClientService, USER_REPOSITORY,
        ListAppointmentsUseCase, CreateAppointmentUseCase,
        CancelAppointmentUseCase, UpdateAppointmentUseCase, CreateReminderUseCase,
      ],
    },
  ],
  exports: [BaileysService],
})
export class WhatsAppModule implements OnApplicationBootstrap {
  constructor(
    private readonly baileys: BaileysService,
    private readonly consumer: ReminderConsumerService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const userRepo = this.moduleRef.get(USER_REPOSITORY, { strict: false });
    const apptRepo = this.moduleRef.get(APPOINTMENT_REPOSITORY, { strict: false });
    this.consumer.setDependencies(userRepo, apptRepo, this.baileys.sendText.bind(this.baileys));
  }
}
