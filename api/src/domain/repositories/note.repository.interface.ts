import { Note } from '../entities/note.entity';

export interface INoteRepository {
  findAll(userId: string): Promise<Note[]>;
  findById(id: string): Promise<Note | null>;
  save(note: Note): Promise<void>;
  delete(id: string): Promise<void>;
}

export const NOTE_REPOSITORY = Symbol('INoteRepository');
