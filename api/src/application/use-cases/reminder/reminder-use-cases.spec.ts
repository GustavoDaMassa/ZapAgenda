import { ListRemindersUseCase } from './list-reminders.use-case';
import { CreateReminderUseCase } from './create-reminder.use-case';
import { DeleteReminderUseCase } from './delete-reminder.use-case';
import { IReminderRepository } from '../../../domain/repositories/reminder.repository.interface';
import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Reminder } from '../../../domain/entities/reminder.entity';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { ReminderNotFoundException } from '../../../domain/exceptions/reminder-not-found.exception';

const futureDate = () => new Date(Date.now() + 60 * 60 * 1000);

const makeReminder = () =>
  Reminder.create({ appointmentId: 'appt-1', minutesBefore: 30, scheduledFor: futureDate() });

const makeAppointment = () =>
  Appointment.create({
    title: 'Dentista',
    startTime: futureDate(),
    categoryId: 'cat-1',
    createdVia: 'dashboard',
  });

const mockReminderRepo = (): jest.Mocked<IReminderRepository> => ({
  findByAppointment: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockAppointmentRepo = (): jest.Mocked<IAppointmentRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findOverlapping: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ListRemindersUseCase', () => {
  it('returns reminders for an appointment', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());
    reminderRepo.findByAppointment.mockResolvedValue([makeReminder()]);

    const result = await new ListRemindersUseCase(reminderRepo, apptRepo).execute('appt-1');
    expect(result).toHaveLength(1);
  });

  it('throws NotFoundException when appointment does not exist', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(null);

    await expect(
      new ListRemindersUseCase(reminderRepo, apptRepo).execute('ghost'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('CreateReminderUseCase', () => {
  it('creates and persists a reminder', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());

    const result = await new CreateReminderUseCase(reminderRepo, apptRepo).execute('appt-1', {
      minutesBefore: 30,
      scheduledFor: futureDate().toISOString(),
    });

    expect(reminderRepo.save).toHaveBeenCalled();
    expect(result.minutesBefore).toBe(30);
    expect(result.status).toBe('pending');
  });

  it('throws NotFoundException when appointment does not exist', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(null);

    await expect(
      new CreateReminderUseCase(reminderRepo, apptRepo).execute('ghost', {
        minutesBefore: 30,
        scheduledFor: futureDate().toISOString(),
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('DeleteReminderUseCase', () => {
  it('deletes an existing reminder', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());
    reminderRepo.findById.mockResolvedValue(makeReminder());

    await new DeleteReminderUseCase(reminderRepo, apptRepo).execute('appt-1', 'rem-1');
    expect(reminderRepo.delete).toHaveBeenCalledWith('rem-1');
  });

  it('throws NotFoundException when appointment does not exist', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(null);

    await expect(
      new DeleteReminderUseCase(reminderRepo, apptRepo).execute('ghost', 'rem-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ReminderNotFoundException when reminder does not exist', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());
    reminderRepo.findById.mockResolvedValue(null);

    await expect(
      new DeleteReminderUseCase(reminderRepo, apptRepo).execute('appt-1', 'ghost'),
    ).rejects.toBeInstanceOf(ReminderNotFoundException);
  });
});
