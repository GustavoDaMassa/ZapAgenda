import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsPositive } from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({ example: 30, description: 'Quantos minutos antes do compromisso o lembrete deve ser enviado' })
  @IsInt()
  @IsPositive()
  minutesBefore: number;

  @ApiProperty({ example: '2026-06-15T09:30:00.000Z', description: 'Data e hora exata para disparar o lembrete (ISO 8601, UTC)' })
  @IsDateString()
  scheduledFor: string;
}
