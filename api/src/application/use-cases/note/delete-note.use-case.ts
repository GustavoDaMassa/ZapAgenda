import { INoteRepository } from '../../../domain/repositories/note.repository.interface';
import { NoteNotFoundException } from '../../../domain/exceptions/note-not-found.exception';
export class DeleteNoteUseCase {
  constructor(private readonly repo: INoteRepository) {}
  async execute(id: string, userId: string): Promise<void> {
    const note = await this.repo.findById(id);
    if (!note || !note.isOwnedBy(userId)) throw new NoteNotFoundException(id);
    await this.repo.delete(id);
  }
}
