import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import { Appointment, CreatedVia } from './entities/appointment.entity';
import { AppointmentNotFoundException } from './exceptions/appointment-not-found.exception';

const mockAppointment = (): Appointment =>
  Appointment.create({
    title: 'Dentist',
    startTime: new Date('2026-06-01T15:00:00'),
    categoryId: 'cat-uuid',
  });

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let repo: jest.Mocked<Repository<Appointment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AppointmentsService);
    repo = module.get(getRepositoryToken(Appointment));
  });

  describe('findAll', () => {
    it('should return all appointments using filters', async () => {
      const appointments = [mockAppointment()];
      repo.find.mockResolvedValue(appointments);

      const result = await service.findAll({});

      expect(result).toEqual(appointments);
      expect(repo.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return appointment when found', async () => {
      const appointment = mockAppointment();
      repo.findOne.mockResolvedValue(appointment);

      const result = await service.findOne('uuid');

      expect(result).toEqual(appointment);
    });

    it('should throw AppointmentNotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        AppointmentNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should save and return a new appointment', async () => {
      const dto = {
        title: 'Meeting',
        startTime: new Date(),
        categoryId: 'cat-uuid',
        createdVia: CreatedVia.DASHBOARD,
      };
      const saved = Appointment.create(dto);
      repo.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result.title).toBe('Meeting');
    });
  });

  describe('update', () => {
    it('should update and return the appointment', async () => {
      const appointment = mockAppointment();
      repo.findOne.mockResolvedValue(appointment);
      repo.save.mockResolvedValue({ ...appointment, title: 'Updated' });

      const result = await service.update('uuid', { title: 'Updated' });

      expect(result.title).toBe('Updated');
    });

    it('should throw AppointmentNotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('missing', { title: 'X' })).rejects.toThrow(
        AppointmentNotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel and save the appointment', async () => {
      const appointment = mockAppointment();
      repo.findOne.mockResolvedValue(appointment);
      repo.save.mockResolvedValue({ ...appointment, isCancelled: true });

      const result = await service.cancel('uuid');

      expect(result.isCancelled).toBe(true);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw AppointmentNotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.cancel('missing')).rejects.toThrow(
        AppointmentNotFoundException,
      );
    });
  });
});
