import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CreatedVia, RecurrenceRule } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'Dentist appointment' })
  @IsString()
  title: string;

  @ApiProperty({ example: '2026-06-01T15:00:00' })
  @IsDateString()
  startTime: Date;

  @ApiProperty({ example: 'cat-uuid' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 'Annual checkup' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-06-01T16:00:00' })
  @IsOptional()
  @IsDateString()
  endTime?: Date;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({ enum: RecurrenceRule })
  @IsOptional()
  @IsEnum(RecurrenceRule)
  recurrenceRule?: RecurrenceRule;

  @ApiPropertyOptional({ enum: CreatedVia, default: CreatedVia.DASHBOARD })
  @IsOptional()
  @IsEnum(CreatedVia)
  createdVia?: CreatedVia;
}
