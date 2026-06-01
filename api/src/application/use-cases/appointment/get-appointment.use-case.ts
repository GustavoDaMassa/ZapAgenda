import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';

export class GetAppointmentUseCase {
  constructor(private readonly repo: IAppointmentRepository) {}

  async execute(id: string, userId: string): Promise<Appointment> {
    const appointment = await this.repo.findById(id);
    if (!appointment || !appointment.isOwnedBy(userId))
      throw new NotFoundException('Appointment', id);
    return appointment;
  }
}
