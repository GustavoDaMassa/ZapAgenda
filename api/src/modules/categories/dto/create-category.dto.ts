import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Work' })
  @IsString()
  name: string;

  @ApiProperty({ example: '#FF5733' })
  @IsHexColor()
  color: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  defaultReminderMinutes?: number;
}
