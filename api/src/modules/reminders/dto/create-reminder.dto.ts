import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  minutesBefore: number;

  @ApiProperty({ example: '2026-06-01T14:30:00' })
  @IsDateString()
  scheduledFor: Date;
}
