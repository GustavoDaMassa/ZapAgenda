import { ListAppointmentsUseCase } from './list-appointments.use-case';
import { GetAppointmentUseCase } from './get-appointment.use-case';
import { CreateAppointmentUseCase } from './create-appointment.use-case';
import { UpdateAppointmentUseCase } from './update-appointment.use-case';
import { CancelAppointmentUseCase } from './cancel-appointment.use-case';
import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { ConflictException } from '../../../domain/exceptions/conflict.exception';

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';

const baseInput = {
  title: 'Dentista',
  startTime: new Date('2026-06-01T10:00:00Z'),
  endTime: new Date('2026-06-01T11:00:00Z'),
  categoryId: 'cat-1',
  createdVia: 'dashboard' as const,
  userId: USER_ID,
};

const makeAppointment = () => Appointment.create(baseInput);

const mockRepo = (): jest.Mocked<IAppointmentRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findOverlapping: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ListAppointmentsUseCase', () => {
  it('returns appointments scoped to userId', async () => {
    const repo = mockRepo();
    repo.findAll.mockResolvedValue([makeAppointment()]);
    const result = await new ListAppointmentsUseCase(repo).execute({}, USER_ID);
    expect(result).toHaveLength(1);
    expect(repo.findAll).toHaveBeenCalledWith(expect.objectContaining({ userId: USER_ID }));
  });
});

describe('GetAppointmentUseCase', () => {
  it('returns appointment for the owner', async () => {
    const repo = mockRepo();
    const apt = makeAppointment();
    repo.findById.mockResolvedValue(apt);
    const result = await new GetAppointmentUseCase(repo).execute(apt.id, USER_ID);
    expect(result.id).toBe(apt.id);
  });

  it('throws NotFoundException when not found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    await expect(new GetAppointmentUseCase(repo).execute('ghost', USER_ID)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when appointment belongs to another user', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeAppointment());
    await expect(new GetAppointmentUseCase(repo).execute('id', OTHER_USER_ID)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('CreateAppointmentUseCase', () => {
  it('creates and persists appointment with userId', async () => {
    const repo = mockRepo();
    repo.findOverlapping.mockResolvedValue([]);
    const result = await new CreateAppointmentUseCase(repo).execute(baseInput);
    expect(repo.save).toHaveBeenCalled();
    expect(result.userId).toBe(USER_ID);
  });

  it('throws ConflictException when time slot is taken', async () => {
    const repo = mockRepo();
    repo.findOverlapping.mockResolvedValue([makeAppointment()]);
    await expect(new CreateAppointmentUseCase(repo).execute(baseInput)).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('UpdateAppointmentUseCase', () => {
  it('updates appointment for the owner', async () => {
    const repo = mockRepo();
    const apt = makeAppointment();
    repo.findById.mockResolvedValue(apt);
    repo.findOverlapping.mockResolvedValue([]);
    const result = await new UpdateAppointmentUseCase(repo).execute(
      apt.id, { title: 'Médico', startTime: baseInput.startTime, endTime: baseInput.endTime, categoryId: 'cat-1' }, USER_ID,
    );
    expect(result.title).toBe('Médico');
  });

  it('throws NotFoundException when not found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    await expect(
      new UpdateAppointmentUseCase(repo).execute('ghost', { title: 'X', startTime: baseInput.startTime, categoryId: 'cat-1' }, USER_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when owned by another user', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeAppointment());
    await expect(
      new UpdateAppointmentUseCase(repo).execute('id', { title: 'X', startTime: baseInput.startTime, categoryId: 'cat-1' }, OTHER_USER_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ConflictException on overlapping update', async () => {
    const repo = mockRepo();
    const apt = makeAppointment();
    repo.findById.mockResolvedValue(apt);
    repo.findOverlapping.mockResolvedValue([makeAppointment()]);
    await expect(
      new UpdateAppointmentUseCase(repo).execute(apt.id, { title: 'X', startTime: baseInput.startTime, endTime: baseInput.endTime, categoryId: 'cat-1' }, USER_ID),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('CancelAppointmentUseCase', () => {
  it('cancels appointment for the owner', async () => {
    const repo = mockRepo();
    const apt = makeAppointment();
    repo.findById.mockResolvedValue(apt);
    await new CancelAppointmentUseCase(repo).execute(apt.id, USER_ID);
    expect(repo.save).toHaveBeenCalled();
  });

  it('throws NotFoundException when not found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    await expect(new CancelAppointmentUseCase(repo).execute('ghost', USER_ID)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when owned by another user', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(makeAppointment());
    await expect(new CancelAppointmentUseCase(repo).execute('id', OTHER_USER_ID)).rejects.toBeInstanceOf(NotFoundException);
  });
});
