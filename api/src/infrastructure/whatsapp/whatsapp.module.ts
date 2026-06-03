import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { BaileysService } from './baileys.service';
import { NlpClientService } from './nlp-client.service';
import { WhatsAppHandler } from './whatsapp-handler';
import { AppointmentsModule } from '../../presentation/modules/appointments.module';
import { RemindersModule } from '../../presentation/modules/reminders.module';
import { TasksModule } from '../../presentation/modules/tasks.module';
import { NotesModule } from '../../presentation/modules/notes.module';
import { CategoriesModule } from '../../presentation/modules/categories.module';
import { AuthModule } from '../../presentation/modules/auth.module';
import { QueueModule } from '../queue/queue.module';
import { ReminderConsumerService } from '../queue/reminder-consumer.service';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { APPOINTMENT_REPOSITORY } from '../../domain/repositories/appointment.repository.interface';
import { TASK_REPOSITORY } from '../../domain/repositories/task.repository.interface';
import { NOTE_REPOSITORY } from '../../domain/repositories/note.repository.interface';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import { REMINDER_REPOSITORY } from '../../domain/repositories/reminder.repository.interface';
import { REMINDER_QUEUE } from '../../domain/queue/reminder-queue.interface';
import { ListAppointmentsUseCase } from '../../application/use-cases/appointment/list-appointments.use-case';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointment/create-appointment.use-case';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointment/cancel-appointment.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointment/update-appointment.use-case';
import { CreateReminderUseCase } from '../../application/use-cases/reminder/create-reminder.use-case';
import { ListTasksUseCase } from '../../application/use-cases/task/list-tasks.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task.use-case';
import { ListNotesUseCase } from '../../application/use-cases/note/list-notes.use-case';
import { CreateNoteUseCase } from '../../application/use-cases/note/create-note.use-case';

const WA_LIST_APPOINTMENTS = Symbol('WA_ListAppointmentsUseCase');
const WA_CREATE_APPOINTMENT = Symbol('WA_CreateAppointmentUseCase');
const WA_CANCEL_APPOINTMENT = Symbol('WA_CancelAppointmentUseCase');
const WA_UPDATE_APPOINTMENT = Symbol('WA_UpdateAppointmentUseCase');
const WA_CREATE_REMINDER    = Symbol('WA_CreateReminderUseCase');
const WA_LIST_TASKS         = Symbol('WA_ListTasksUseCase');
const WA_CREATE_TASK        = Symbol('WA_CreateTaskUseCase');
const WA_UPDATE_TASK        = Symbol('WA_UpdateTaskUseCase');
const WA_LIST_NOTES         = Symbol('WA_ListNotesUseCase');
const WA_CREATE_NOTE        = Symbol('WA_CreateNoteUseCase');

@Module({
  imports: [AppointmentsModule, RemindersModule, TasksModule, NotesModule, CategoriesModule, AuthModule, QueueModule],
  providers: [
    BaileysService,
    NlpClientService,
    { provide: WA_LIST_APPOINTMENTS, useFactory: (r: any) => new ListAppointmentsUseCase(r), inject: [APPOINTMENT_REPOSITORY] },
    { provide: WA_CREATE_APPOINTMENT, useFactory: (r: any) => new CreateAppointmentUseCase(r), inject: [APPOINTMENT_REPOSITORY] },
    { provide: WA_CANCEL_APPOINTMENT, useFactory: (r: any) => new CancelAppointmentUseCase(r), inject: [APPOINTMENT_REPOSITORY] },
    { provide: WA_UPDATE_APPOINTMENT, useFactory: (r: any) => new UpdateAppointmentUseCase(r), inject: [APPOINTMENT_REPOSITORY] },
    {
      provide: WA_CREATE_REMINDER,
      useFactory: (rr: any, ar: any, q: any) => new CreateReminderUseCase(rr, ar, q),
      inject: [REMINDER_REPOSITORY, APPOINTMENT_REPOSITORY, REMINDER_QUEUE],
    },
    { provide: WA_LIST_TASKS, useFactory: (r: any) => new ListTasksUseCase(r), inject: [TASK_REPOSITORY] },
    { provide: WA_CREATE_TASK, useFactory: (r: any) => new CreateTaskUseCase(r), inject: [TASK_REPOSITORY] },
    { provide: WA_UPDATE_TASK, useFactory: (r: any) => new UpdateTaskUseCase(r), inject: [TASK_REPOSITORY] },
    { provide: WA_LIST_NOTES, useFactory: (r: any) => new ListNotesUseCase(r), inject: [NOTE_REPOSITORY] },
    { provide: WA_CREATE_NOTE, useFactory: (r: any) => new CreateNoteUseCase(r), inject: [NOTE_REPOSITORY] },
    {
      provide: WhatsAppHandler,
      useFactory: (
        baileys: BaileysService, nlp: NlpClientService, userRepo: any, categoryRepo: any,
        listAppt: any, createAppt: any, cancelAppt: any, updateAppt: any, createReminder: any,
        listTasks: any, createTask: any, updateTask: any,
        listNotes: any, createNote: any,
      ) => new WhatsAppHandler(
        baileys, nlp, userRepo, categoryRepo,
        listAppt, createAppt, cancelAppt, updateAppt, createReminder,
        listTasks, createTask, updateTask,
        listNotes, createNote,
      ),
      inject: [
        BaileysService, NlpClientService, USER_REPOSITORY, CATEGORY_REPOSITORY,
        WA_LIST_APPOINTMENTS, WA_CREATE_APPOINTMENT, WA_CANCEL_APPOINTMENT,
        WA_UPDATE_APPOINTMENT, WA_CREATE_REMINDER,
        WA_LIST_TASKS, WA_CREATE_TASK, WA_UPDATE_TASK,
        WA_LIST_NOTES, WA_CREATE_NOTE,
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
