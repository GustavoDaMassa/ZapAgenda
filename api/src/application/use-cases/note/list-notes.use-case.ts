import { INoteRepository } from '../../../domain/repositories/note.repository.interface';
import { Note } from '../../../domain/entities/note.entity';
export class ListNotesUseCase {
  constructor(private readonly repo: INoteRepository) {}
  execute(userId: string): Promise<Note[]> { return this.repo.findAll(userId); }
}
