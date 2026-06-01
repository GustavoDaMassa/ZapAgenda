import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAppointmentDto {
  @ApiProperty({ example: 'Consulta médica atualizada', description: 'Novo título do compromisso' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '2026-06-15T14:00:00.000Z', description: 'Nova data e hora de início (ISO 8601, UTC)' })
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @ApiProperty({ example: 'b2f1c3d4-e5f6-7890-abcd-ef1234567890', description: 'ID da categoria' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 'Novo andar, sala 302', description: 'Observações atualizadas' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: '2026-06-15T15:00:00.000Z', description: 'Nova data e hora de término (ISO 8601, UTC)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date | null;
}
