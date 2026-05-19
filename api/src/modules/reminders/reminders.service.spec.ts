import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemindersService } from './reminders.service';
import { Reminder } from './entities/reminder.entity';
import { ReminderNotFoundException } from './exceptions/reminder-not-found.exception';

const mockReminder = (): Reminder =>
  Reminder.create({
    appointmentId: 'apt-uuid',
    minutesBefore: 30,
    scheduledFor: new Date('2026-06-01T14:30:00'),
  });

describe('RemindersService', () => {
  let service: RemindersService;
  let repo: jest.Mocked<Repository<Reminder>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        {
          provide: getRepositoryToken(Reminder),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RemindersService);
    repo = module.get(getRepositoryToken(Reminder));
  });

  describe('findByAppointment', () => {
    it('should return reminders for a given appointment', async () => {
      const reminders = [mockReminder()];
      repo.find.mockResolvedValue(reminders);

      const result = await service.findByAppointment('apt-uuid');

      expect(result).toEqual(reminders);
      expect(repo.find).toHaveBeenCalledWith({
        where: { appointmentId: 'apt-uuid' },
      });
    });
  });

  describe('create', () => {
    it('should create and save a reminder', async () => {
      const reminder = mockReminder();
      repo.save.mockResolvedValue(reminder);

      const result = await service.create('apt-uuid', {
        minutesBefore: 30,
        scheduledFor: new Date(),
      });

      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result.minutesBefore).toBe(30);
    });
  });

  describe('remove', () => {
    it('should delete a reminder', async () => {
      const reminder = mockReminder();
      repo.findOne.mockResolvedValue(reminder);

      await service.remove('apt-uuid', 'rem-uuid');

      expect(repo.delete).toHaveBeenCalledWith('rem-uuid');
    });

    it('should throw ReminderNotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('apt-uuid', 'missing')).rejects.toThrow(
        ReminderNotFoundException,
      );
    });
  });
});
