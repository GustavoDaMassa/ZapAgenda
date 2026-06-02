import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Comprar pão integral', description: 'Novo título da tarefa' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Padaria nova na rua 5', description: 'Nova descrição' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: true, description: 'true = concluída, false = reabrir' })
  @IsOptional()
  @IsBoolean()
  isDone?: boolean;
}
