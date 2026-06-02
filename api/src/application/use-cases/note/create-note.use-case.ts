import { INoteRepository } from '../../../domain/repositories/note.repository.interface';
import { Note, CreateNoteInput } from '../../../domain/entities/note.entity';
export class CreateNoteUseCase {
  constructor(private readonly repo: INoteRepository) {}
  async execute(input: CreateNoteInput): Promise<Note> {
    const note = Note.create(input);
    await this.repo.save(note);
    return note;
  }
}
