import { IsHexColor, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsHexColor()
  color: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  defaultReminderMinutes?: number;
}
