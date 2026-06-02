import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateNoteDto {
  @ApiProperty({ example: 'Reunião Q3', description: 'Título da nota' })
  @IsString() @IsNotEmpty() title: string;

  @ApiProperty({ example: 'Discutir orçamento com o time de produto', description: 'Conteúdo da nota (texto livre)' })
  @IsString() content: string;
}
