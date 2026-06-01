import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
import {
  AppointmentFilters,
  IAppointmentRepository,
} from '../../domain/repositories/appointment.repository.interface';
import { Appointment, CreatedVia, RecurrenceRule } from '../../domain/entities/appointment.entity';
import { AppointmentOrmEntity } from './appointment.orm-entity';

@Injectable()
export class AppointmentRepository implements IAppointmentRepository {
  constructor(
    @InjectRepository(AppointmentOrmEntity)
    private readonly repo: Repository<AppointmentOrmEntity>,
  ) {}

  async findAll(filters: AppointmentFilters): Promise<Appointment[]> {
    const where: Record<string, unknown> = { userId: filters.userId };
    if (filters.categoryId) where['categoryId'] = filters.categoryId;
    if (filters.start && filters.end)
      where['startTime'] = Between(filters.start, filters.end);
    else if (filters.start) where['startTime'] = MoreThan(filters.start);
    else if (filters.end) where['startTime'] = LessThan(filters.end);

    const rows = await this.repo.find({ where });
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<Appointment | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findOverlapping(startTime: Date, endTime: Date, userId: string, excludeId?: string): Promise<Appointment[]> {
    const qb = this.repo
      .createQueryBuilder('a')
      .where('a.user_id = :userId', { userId })
      .andWhere('a.is_cancelled = false')
      .andWhere('a.start_time < :end AND (a.end_time IS NULL OR a.end_time > :start)', {
        start: startTime,
        end: endTime,
      });

    if (excludeId) qb.andWhere('a.id != :excludeId', { excludeId });

    const rows = await qb.getMany();
    return rows.map(this.toDomain);
  }

  async save(appointment: Appointment): Promise<void> {
    await this.repo.save({
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      categoryId: appointment.categoryId,
      userId: appointment.userId,
      isRecurring: appointment.isRecurring,
      recurrenceRule: appointment.recurrenceRule,
      isCancelled: appointment.isCancelled,
      createdVia: appointment.createdVia,
    });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: AppointmentOrmEntity): Appointment {
    return Appointment.reconstitute(
      row.id, row.title, row.description,
      row.startTime, row.endTime, row.categoryId,
      row.isRecurring, row.recurrenceRule as RecurrenceRule | null,
      row.isCancelled, row.createdVia as CreatedVia, row.userId,
      row.createdAt, row.updatedAt,
    );
  }
}
