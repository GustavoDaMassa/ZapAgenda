import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Reuniões importantes', description: 'Novo nome da categoria' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '#2ECC71', description: 'Nova cor em hexadecimal' })
  @IsHexColor()
  color: string;

  @ApiPropertyOptional({ example: 60, description: 'Nova antecedência padrão em minutos (null para remover)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  defaultReminderMinutes?: number | null;
}
