import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';
import { ConflictException } from '../../../domain/exceptions/conflict.exception';

export interface UpdateAppointmentInput {
  title: string;
  startTime: Date;
  categoryId: string;
  description?: string | null;
  endTime?: Date | null;
}

export class UpdateAppointmentUseCase {
  constructor(private readonly repo: IAppointmentRepository) {}

  async execute(id: string, input: UpdateAppointmentInput): Promise<Appointment> {
    const appointment = await this.repo.findById(id);
    if (!appointment) throw new NotFoundException('Appointment', id);

    const endTime = input.endTime ?? new Date(input.startTime.getTime() + 60 * 60 * 1000);
    const overlapping = await this.repo.findOverlapping(input.startTime, endTime, id);
    if (overlapping.length > 0) {
      throw new ConflictException('There is already an appointment in this time slot');
    }

    appointment.update(
      input.title,
      input.description ?? null,
      input.startTime,
      input.endTime ?? null,
      input.categoryId,
    );
    await this.repo.save(appointment);
    return appointment;
  }
}
