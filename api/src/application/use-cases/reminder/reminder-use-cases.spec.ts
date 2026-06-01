import { ListRemindersUseCase } from './list-reminders.use-case';
import { CreateReminderUseCase } from './create-reminder.use-case';
import { DeleteReminderUseCase } from './delete-reminder.use-case';
import { IReminderRepository } from '../../../domain/repositories/reminder.repository.interface';
import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Reminder } from '../../../domain/entities/reminder.entity';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { ReminderNotFoundException } from '../../../domain/exceptions/reminder-not-found.exception';

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';
const futureDate = () => new Date(Date.now() + 60 * 60 * 1000);

const makeReminder = () =>
  Reminder.create({ appointmentId: 'appt-1', minutesBefore: 30, scheduledFor: futureDate() });

const makeAppointment = () =>
  Appointment.create({ title: 'Dentista', startTime: futureDate(), categoryId: 'cat-1', createdVia: 'dashboard', userId: USER_ID });

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
  it('returns reminders for the owner', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());
    reminderRepo.findByAppointment.mockResolvedValue([makeReminder()]);
    const result = await new ListRemindersUseCase(reminderRepo, apptRepo).execute('appt-1', USER_ID);
    expect(result).toHaveLength(1);
  });

  it('throws NotFoundException when appointment not found or not owned', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(null);
    await expect(new ListRemindersUseCase(reminderRepo, apptRepo).execute('ghost', USER_ID)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when owned by another user', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());
    await expect(new ListRemindersUseCase(reminderRepo, apptRepo).execute('appt-1', OTHER_USER_ID)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('CreateReminderUseCase', () => {
  it('creates and persists a reminder for the owner', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());
    const result = await new CreateReminderUseCase(reminderRepo, apptRepo).execute(
      'appt-1', { minutesBefore: 30, scheduledFor: futureDate().toISOString() }, USER_ID,
    );
    expect(reminderRepo.save).toHaveBeenCalled();
    expect(result.minutesBefore).toBe(30);
  });

  it('throws NotFoundException when appointment not owned', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());
    await expect(
      new CreateReminderUseCase(reminderRepo, apptRepo).execute('appt-1', { minutesBefore: 30, scheduledFor: futureDate().toISOString() }, OTHER_USER_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('DeleteReminderUseCase', () => {
  it('deletes an existing reminder for the owner', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());
    reminderRepo.findById.mockResolvedValue(makeReminder());
    await new DeleteReminderUseCase(reminderRepo, apptRepo).execute('appt-1', 'rem-1', USER_ID);
    expect(reminderRepo.delete).toHaveBeenCalledWith('rem-1');
  });

  it('throws NotFoundException when appointment not owned', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());
    await expect(new DeleteReminderUseCase(reminderRepo, apptRepo).execute('appt-1', 'rem-1', OTHER_USER_ID)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ReminderNotFoundException when reminder does not exist', async () => {
    const reminderRepo = mockReminderRepo();
    const apptRepo = mockAppointmentRepo();
    apptRepo.findById.mockResolvedValue(makeAppointment());
    reminderRepo.findById.mockResolvedValue(null);
    await expect(new DeleteReminderUseCase(reminderRepo, apptRepo).execute('appt-1', 'ghost', USER_ID)).rejects.toBeInstanceOf(ReminderNotFoundException);
  });
});
