import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

export class FindAppointmentsQueryDto {
  @ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z', description: 'Filtrar compromissos a partir desta data (ISO 8601)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start?: Date;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z', description: 'Filtrar compromissos até esta data (ISO 8601)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end?: Date;

  @ApiPropertyOptional({ example: 'b2f1c3d4-e5f6-7890-abcd-ef1234567890', description: 'Filtrar por ID de categoria' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
