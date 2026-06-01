import { AppointmentFilters, IAppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';

export class ListAppointmentsUseCase {
  constructor(private readonly repo: IAppointmentRepository) {}

  execute(filters: Omit<AppointmentFilters, 'userId'>, userId: string): Promise<Appointment[]> {
    return this.repo.findAll({ ...filters, userId });
  }
}
