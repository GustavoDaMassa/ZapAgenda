import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import type { CreatedVia, RecurrenceRule } from '../../../domain/entities/appointment.entity';

const CREATED_VIA = ['whatsapp', 'dashboard'] as const;
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

  @IsEnum(CREATED_VIA)
  createdVia: CreatedVia;

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
