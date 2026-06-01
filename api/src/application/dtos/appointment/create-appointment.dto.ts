import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import type { RecurrenceRule } from '../../../domain/entities/appointment.entity';

const RECURRENCE_RULES = ['daily', 'weekly', 'monthly'] as const;

export class CreateAppointmentDto {
  @ApiProperty({ example: 'Consulta médica', description: 'Título do compromisso' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '2026-06-15T10:00:00.000Z', description: 'Data e hora de início (ISO 8601, UTC)' })
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @ApiProperty({ example: 'b2f1c3d4-e5f6-7890-abcd-ef1234567890', description: 'ID da categoria' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 'Levar exames anteriores', description: 'Observações opcionais' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-06-15T11:00:00.000Z', description: 'Data e hora de término (ISO 8601, UTC)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @ApiPropertyOptional({ enum: RECURRENCE_RULES, example: 'weekly', description: 'Regra de recorrência (requer isRecurring=true)' })
  @IsOptional()
  @IsEnum(RECURRENCE_RULES)
  recurrenceRule?: RecurrenceRule;
}
