import { Appointment } from '../entities/appointment.entity';

export interface AppointmentFilters {
  start?: Date;
  end?: Date;
  categoryId?: string;
}

export interface IAppointmentRepository {
  findAll(filters: AppointmentFilters): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  findOverlapping(startTime: Date, endTime: Date, excludeId?: string): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
  delete(id: string): Promise<void>;
}

export const APPOINTMENT_REPOSITORY = Symbol('IAppointmentRepository');
