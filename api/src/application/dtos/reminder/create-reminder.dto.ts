import { IsDateString, IsInt, IsPositive } from 'class-validator';

export class CreateReminderDto {
  @IsInt()
  @IsPositive()
  minutesBefore: number;

  @IsDateString()
  scheduledFor: string;
}
