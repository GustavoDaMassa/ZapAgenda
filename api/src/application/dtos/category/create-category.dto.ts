import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Reuniões', description: 'Nome da categoria' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '#3498DB', description: 'Cor em hexadecimal (ex: #FF0000)' })
  @IsHexColor()
  color: string;

  @ApiPropertyOptional({ example: 30, description: 'Antecedência padrão do lembrete em minutos' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  defaultReminderMinutes?: number;
}
