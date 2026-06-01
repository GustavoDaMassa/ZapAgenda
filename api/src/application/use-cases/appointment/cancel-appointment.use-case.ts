import { IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';

export class CancelAppointmentUseCase {
  constructor(private readonly repo: IAppointmentRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const appointment = await this.repo.findById(id);
    if (!appointment || !appointment.isOwnedBy(userId))
      throw new NotFoundException('Appointment', id);

    appointment.cancel();
    await this.repo.save(appointment);
  }
}
