import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesController } from '../controllers/notes.controller';
import { ListNotesUseCase } from '../../application/use-cases/note/list-notes.use-case';
import { CreateNoteUseCase } from '../../application/use-cases/note/create-note.use-case';
import { UpdateNoteUseCase } from '../../application/use-cases/note/update-note.use-case';
import { DeleteNoteUseCase } from '../../application/use-cases/note/delete-note.use-case';
import { NoteRepository } from '../../infrastructure/persistence/note.repository';
import { NoteOrmEntity } from '../../infrastructure/persistence/note.orm-entity';
import { NOTE_REPOSITORY } from '../../domain/repositories/note.repository.interface';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([NoteOrmEntity]), AuthModule],
  controllers: [NotesController],
  providers: [
    { provide: NOTE_REPOSITORY, useClass: NoteRepository },
    { provide: ListNotesUseCase, useFactory: (r: NoteRepository) => new ListNotesUseCase(r), inject: [NOTE_REPOSITORY] },
    { provide: CreateNoteUseCase, useFactory: (r: NoteRepository) => new CreateNoteUseCase(r), inject: [NOTE_REPOSITORY] },
    { provide: UpdateNoteUseCase, useFactory: (r: NoteRepository) => new UpdateNoteUseCase(r), inject: [NOTE_REPOSITORY] },
    { provide: DeleteNoteUseCase, useFactory: (r: NoteRepository) => new DeleteNoteUseCase(r), inject: [NOTE_REPOSITORY] },
  ],
})
export class NotesModule {}
