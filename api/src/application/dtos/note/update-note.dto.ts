import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
export class UpdateNoteDto {
  @ApiPropertyOptional({ example: 'Reunião Q3 — atualizada', description: 'Novo título' })
  @IsOptional() @IsString() title?: string;

  @ApiPropertyOptional({ example: 'Conteúdo atualizado', description: 'Novo conteúdo' })
  @IsOptional() @IsString() content?: string;

  @ApiPropertyOptional({ example: true, description: 'true = fixar no topo, false = desafixar' })
  @IsOptional() @IsBoolean() isPinned?: boolean;
}
