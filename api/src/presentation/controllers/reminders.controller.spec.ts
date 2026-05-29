import { Test, TestingModule } from '@nestjs/testing';
import { RemindersController } from './reminders.controller';
import { ListRemindersUseCase } from '../../application/use-cases/reminder/list-reminders.use-case';
import { CreateReminderUseCase } from '../../application/use-cases/reminder/create-reminder.use-case';
import { DeleteReminderUseCase } from '../../application/use-cases/reminder/delete-reminder.use-case';
import { Reminder } from '../../domain/entities/reminder.entity';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { ReminderNotFoundException } from '../../domain/exceptions/reminder-not-found.exception';

const futureDate = () => new Date(Date.now() + 60 * 60 * 1000);

const makeReminder = () =>
  Reminder.create({ appointmentId: 'appt-1', minutesBefore: 30, scheduledFor: futureDate() });

const mockList = { execute: jest.fn() };
const mockCreate = { execute: jest.fn() };
const mockDelete = { execute: jest.fn() };

describe('RemindersController', () => {
  let controller: RemindersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemindersController],
      providers: [
        { provide: ListRemindersUseCase, useValue: mockList },
        { provide: CreateReminderUseCase, useValue: mockCreate },
        { provide: DeleteReminderUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get(RemindersController);
    jest.clearAllMocks();
  });

  it('GET returns reminders for appointment', async () => {
    mockList.execute.mockResolvedValue([makeReminder()]);
    const result = await controller.findAll('appt-1');
    expect(result).toHaveLength(1);
    expect(mockList.execute).toHaveBeenCalledWith('appt-1');
  });

  it('GET propagates NotFoundException when appointment not found', async () => {
    mockList.execute.mockRejectedValue(new NotFoundException('Appointment', 'ghost'));
    await expect(controller.findAll('ghost')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('POST creates a reminder', async () => {
    const r = makeReminder();
    mockCreate.execute.mockResolvedValue(r);
    const result = await controller.create('appt-1', {
      minutesBefore: 30,
      scheduledFor: futureDate().toISOString(),
    });
    expect(result).toBe(r);
  });

  it('DELETE removes a reminder', async () => {
    mockDelete.execute.mockResolvedValue(undefined);
    await expect(controller.remove('appt-1', 'rem-1')).resolves.toBeUndefined();
    expect(mockDelete.execute).toHaveBeenCalledWith('appt-1', 'rem-1');
  });

  it('DELETE propagates ReminderNotFoundException', async () => {
    mockDelete.execute.mockRejectedValue(new ReminderNotFoundException('ghost'));
    await expect(controller.remove('appt-1', 'ghost')).rejects.toBeInstanceOf(ReminderNotFoundException);
  });
});
