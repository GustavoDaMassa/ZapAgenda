import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';

export class GetAppointmentUseCase {
  constructor(private readonly repo: IAppointmentRepository) {}

  async execute(id: string): Promise<Appointment> {
    const appointment = await this.repo.findById(id);
    if (!appointment) throw new NotFoundException('Appointment', id);
    return appointment;
  }
}
