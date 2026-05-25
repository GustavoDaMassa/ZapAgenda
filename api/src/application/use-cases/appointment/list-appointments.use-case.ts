import {
  AppointmentFilters,
  IAppointmentRepository,
} from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../domain/entities/appointment.entity';

export class ListAppointmentsUseCase {
  constructor(private readonly repo: IAppointmentRepository) {}

  execute(filters: AppointmentFilters): Promise<Appointment[]> {
    return this.repo.findAll(filters);
  }
}
