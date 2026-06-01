import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import type { RecurrenceRule } from '../../../domain/entities/appointment.entity';

const RECURRENCE_RULES = ['daily', 'weekly', 'monthly'] as const;

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsEnum(RECURRENCE_RULES)
  recurrenceRule?: RecurrenceRule;
}
