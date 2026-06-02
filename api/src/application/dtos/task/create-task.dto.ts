import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Comprar pão', description: 'Título da tarefa' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Padaria do João', description: 'Descrição ou detalhe adicional' })
  @IsOptional()
  @IsString()
  description?: string;
}
