import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { AppointmentNotFoundException } from './exceptions/appointment-not-found.exception';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  findAll(query: FindAppointmentsQueryDto): Promise<Appointment[]> {
    const options: FindManyOptions<Appointment> = { where: {} };

    if (query.categoryId) {
      (options.where as Record<string, unknown>).categoryId = query.categoryId;
    }

    if (query.start && query.end) {
      (options.where as Record<string, unknown>).startTime = Between(
        new Date(query.start),
        new Date(query.end),
      );
    }

    return this.appointmentRepository.find(options);
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });
    if (!appointment) throw new AppointmentNotFoundException(id);
    return appointment;
  }

  create(dto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = Appointment.create(dto);
    return this.appointmentRepository.save(appointment);
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, dto);
    return this.appointmentRepository.save(appointment);
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.cancel();
    return this.appointmentRepository.save(appointment);
  }
}
