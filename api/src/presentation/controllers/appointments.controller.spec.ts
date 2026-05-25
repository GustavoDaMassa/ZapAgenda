import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { ListAppointmentsUseCase } from '../../application/use-cases/appointment/list-appointments.use-case';
import { GetAppointmentUseCase } from '../../application/use-cases/appointment/get-appointment.use-case';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointment/create-appointment.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointment/update-appointment.use-case';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointment/cancel-appointment.use-case';
import { Appointment } from '../../domain/entities/appointment.entity';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { ConflictException } from '../../domain/exceptions/conflict.exception';

const makeAppointment = () =>
  Appointment.create({
    title: 'Dentista',
    startTime: new Date('2026-06-01T10:00:00Z'),
    categoryId: 'cat-1',
    createdVia: 'dashboard',
  });

const mockList = { execute: jest.fn() };
const mockGet = { execute: jest.fn() };
const mockCreate = { execute: jest.fn() };
const mockUpdate = { execute: jest.fn() };
const mockCancel = { execute: jest.fn() };

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        { provide: ListAppointmentsUseCase, useValue: mockList },
        { provide: GetAppointmentUseCase, useValue: mockGet },
        { provide: CreateAppointmentUseCase, useValue: mockCreate },
        { provide: UpdateAppointmentUseCase, useValue: mockUpdate },
        { provide: CancelAppointmentUseCase, useValue: mockCancel },
      ],
    }).compile();

    controller = module.get(AppointmentsController);
    jest.clearAllMocks();
  });

  it('GET / returns list of appointments', async () => {
    mockList.execute.mockResolvedValue([makeAppointment()]);
    const result = await controller.findAll({});
    expect(result).toHaveLength(1);
  });

  it('GET /:id returns appointment', async () => {
    const apt = makeAppointment();
    mockGet.execute.mockResolvedValue(apt);
    const result = await controller.findOne(apt.id);
    expect(result.id).toBe(apt.id);
  });

  it('GET /:id propagates NotFoundException', async () => {
    mockGet.execute.mockRejectedValue(new NotFoundException('Appointment', 'ghost'));
    await expect(controller.findOne('ghost')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('POST / creates an appointment', async () => {
    const apt = makeAppointment();
    mockCreate.execute.mockResolvedValue(apt);
    const result = await controller.create({
      title: 'Dentista',
      startTime: new Date('2026-06-01T10:00:00Z'),
      categoryId: 'cat-1',
      createdVia: 'dashboard',
    });
    expect(result).toBe(apt);
  });

  it('POST / propagates ConflictException', async () => {
    mockCreate.execute.mockRejectedValue(new ConflictException('time conflict'));
    await expect(
      controller.create({
        title: 'X',
        startTime: new Date(),
        categoryId: 'cat-1',
        createdVia: 'dashboard',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('PATCH /:id updates appointment', async () => {
    const apt = makeAppointment();
    mockUpdate.execute.mockResolvedValue(apt);
    const result = await controller.update(apt.id, {
      title: 'Médico',
      startTime: new Date(),
      categoryId: 'cat-1',
    });
    expect(result).toBe(apt);
  });

  it('PATCH /:id propagates NotFoundException', async () => {
    mockUpdate.execute.mockRejectedValue(new NotFoundException('Appointment', 'ghost'));
    await expect(
      controller.update('ghost', { title: 'X', startTime: new Date(), categoryId: 'cat-1' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('DELETE /:id cancels appointment', async () => {
    mockCancel.execute.mockResolvedValue(undefined);
    await expect(controller.cancel('some-id')).resolves.toBeUndefined();
  });

  it('DELETE /:id propagates NotFoundException', async () => {
    mockCancel.execute.mockRejectedValue(new NotFoundException('Appointment', 'ghost'));
    await expect(controller.cancel('ghost')).rejects.toBeInstanceOf(NotFoundException);
  });
});
