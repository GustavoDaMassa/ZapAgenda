import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUserId } from '../../infrastructure/auth/current-user.decorator';
import { ListNotesUseCase } from '../../application/use-cases/note/list-notes.use-case';
import { CreateNoteUseCase } from '../../application/use-cases/note/create-note.use-case';
import { UpdateNoteUseCase } from '../../application/use-cases/note/update-note.use-case';
import { DeleteNoteUseCase } from '../../application/use-cases/note/delete-note.use-case';
import { CreateNoteDto } from '../../application/dtos/note/create-note.dto';
import { UpdateNoteDto } from '../../application/dtos/note/update-note.dto';
import { Note } from '../../domain/entities/note.entity';

const NOTE_EXAMPLE = {
  id: 'n1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'Reunião Q3',
  content: 'Discutir orçamento com o time de produto',
  isPinned: false,
  userId: 'aca55ca9-cebf-462a-8b4c-dc559e515a00',
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(
    private readonly listUseCase: ListNotesUseCase,
    private readonly createUseCase: CreateNoteUseCase,
    private readonly updateUseCase: UpdateNoteUseCase,
    private readonly deleteUseCase: DeleteNoteUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar notas', description: 'Retorna todas as notas do usuário. Notas fixadas (isPinned=true) aparecem primeiro.' })
  @ApiResponse({ status: 200, description: 'Lista de notas', schema: { example: [{ ...NOTE_EXAMPLE, isPinned: true }, NOTE_EXAMPLE] } })
  findAll(@CurrentUserId() userId: string): Promise<Note[]> {
    return this.listUseCase.execute(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nota' })
  @ApiResponse({ status: 201, description: 'Nota criada', schema: { example: NOTE_EXAMPLE } })
  @ApiResponse({ status: 400, description: 'Título vazio' })
  create(@Body() dto: CreateNoteDto, @CurrentUserId() userId: string): Promise<Note> {
    return this.createUseCase.execute({ ...dto, userId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar nota', description: 'Edita título/conteúdo ou altera isPinned para fixar/desafixar.' })
  @ApiParam({ name: 'id', description: 'UUID da nota', example: 'n1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Nota atualizada', schema: { example: { ...NOTE_EXAMPLE, isPinned: true } } })
  @ApiResponse({ status: 404, description: 'Nota não encontrada ou não pertence ao usuário' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
    @CurrentUserId() userId: string,
  ): Promise<Note> {
    return this.updateUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover nota' })
  @ApiParam({ name: 'id', description: 'UUID da nota', example: 'n1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 204, description: 'Nota removida' })
  @ApiResponse({ status: 404, description: 'Nota não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUserId() userId: string): Promise<void> {
    return this.deleteUseCase.execute(id, userId);
  }
}
