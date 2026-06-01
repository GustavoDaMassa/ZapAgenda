import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Appointment, CreateAppointmentInput } from '../../../domain/entities/appointment.entity';
import { ConflictException } from '../../../domain/exceptions/conflict.exception';

export class CreateAppointmentUseCase {
  constructor(private readonly repo: IAppointmentRepository) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    const endTime = input.endTime ?? new Date(input.startTime.getTime() + 60 * 60 * 1000);
    const overlapping = await this.repo.findOverlapping(input.startTime, endTime, input.userId);
    if (overlapping.length > 0)
      throw new ConflictException('There is already an appointment in this time slot');

    const appointment = Appointment.create(input);
    await this.repo.save(appointment);
    return appointment;
  }
}
