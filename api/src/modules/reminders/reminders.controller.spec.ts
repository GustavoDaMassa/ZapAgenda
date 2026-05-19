import { Test, TestingModule } from '@nestjs/testing';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { Reminder } from './entities/reminder.entity';
import { ReminderNotFoundException } from './exceptions/reminder-not-found.exception';

describe('RemindersController', () => {
  let controller: RemindersController;
  let service: jest.Mocked<RemindersService>;

  const mockReminder = (): Reminder =>
    Reminder.create({
      appointmentId: 'apt-uuid',
      minutesBefore: 30,
      scheduledFor: new Date(),
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemindersController],
      providers: [
        {
          provide: RemindersService,
          useValue: {
            findByAppointment: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(RemindersController);
    service = module.get(RemindersService);
  });

  it('findAll should return reminders for appointment', async () => {
    const reminders = [mockReminder()];
    service.findByAppointment.mockResolvedValue(reminders);

    expect(await controller.findAll('apt-uuid')).toEqual(reminders);
    expect(service.findByAppointment).toHaveBeenCalledWith('apt-uuid');
  });

  it('create should return created reminder', async () => {
    const reminder = mockReminder();
    service.create.mockResolvedValue(reminder);

    const result = await controller.create('apt-uuid', {
      minutesBefore: 30,
      scheduledFor: new Date(),
    });

    expect(result).toEqual(reminder);
  });

  it('remove should call service.remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('apt-uuid', 'rem-uuid');

    expect(service.remove).toHaveBeenCalledWith('apt-uuid', 'rem-uuid');
  });

  it('remove should propagate ReminderNotFoundException as 404', async () => {
    service.remove.mockRejectedValue(new ReminderNotFoundException('missing'));

    await expect(controller.remove('apt-uuid', 'missing')).rejects.toThrow(
      ReminderNotFoundException,
    );
  });
});
