import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { AppointmentNotFoundException } from './exceptions/appointment-not-found.exception';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: jest.Mocked<AppointmentsService>;

  const mockAppointment = (): Appointment =>
    Appointment.create({
      title: 'Dentist',
      startTime: new Date('2026-06-01T15:00:00'),
      categoryId: 'cat-uuid',
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            cancel: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AppointmentsController);
    service = module.get(AppointmentsService);
  });

  it('findAll should return array of appointments', async () => {
    const appointments = [mockAppointment()];
    service.findAll.mockResolvedValue(appointments);

    expect(await controller.findAll({})).toEqual(appointments);
  });

  it('findOne should return appointment by id', async () => {
    const appointment = mockAppointment();
    service.findOne.mockResolvedValue(appointment);

    expect(await controller.findOne('uuid')).toEqual(appointment);
  });

  it('findOne should propagate AppointmentNotFoundException as 404', async () => {
    service.findOne.mockRejectedValue(
      new AppointmentNotFoundException('missing'),
    );

    await expect(controller.findOne('missing')).rejects.toThrow(
      AppointmentNotFoundException,
    );
  });

  it('create should return created appointment', async () => {
    const appointment = mockAppointment();
    service.create.mockResolvedValue(appointment);

    const result = await controller.create({
      title: 'Dentist',
      startTime: new Date(),
      categoryId: 'cat-uuid',
    });

    expect(result).toEqual(appointment);
  });

  it('update should return updated appointment', async () => {
    const updated = { ...mockAppointment(), title: 'Updated' };
    service.update.mockResolvedValue(updated as Appointment);

    expect(await controller.update('uuid', { title: 'Updated' })).toEqual(
      updated,
    );
  });

  it('cancel should return cancelled appointment', async () => {
    const cancelled = { ...mockAppointment(), isCancelled: true };
    service.cancel.mockResolvedValue(cancelled as Appointment);

    expect(await controller.cancel('uuid')).toEqual(cancelled);
  });
});
