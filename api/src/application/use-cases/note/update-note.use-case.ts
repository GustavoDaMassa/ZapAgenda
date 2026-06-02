import { INoteRepository } from '../../../domain/repositories/note.repository.interface';
import { Note } from '../../../domain/entities/note.entity';
import { NoteNotFoundException } from '../../../domain/exceptions/note-not-found.exception';

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  isPinned?: boolean;
}

export class UpdateNoteUseCase {
  constructor(private readonly repo: INoteRepository) {}

  async execute(id: string, input: UpdateNoteInput, userId: string): Promise<Note> {
    const note = await this.repo.findById(id);
    if (!note || !note.isOwnedBy(userId)) throw new NoteNotFoundException(id);

    if (input.isPinned === true) note.pin();
    else if (input.isPinned === false) note.unpin();

    if (input.title !== undefined) note.update(input.title, input.content ?? note.content);

    await this.repo.save(note);
    return note;
  }
}
