import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INoteRepository } from '../../domain/repositories/note.repository.interface';
import { Note } from '../../domain/entities/note.entity';
import { NoteOrmEntity } from './note.orm-entity';

@Injectable()
export class NoteRepository implements INoteRepository {
  constructor(@InjectRepository(NoteOrmEntity) private readonly repo: Repository<NoteOrmEntity>) {}

  async findAll(userId: string): Promise<Note[]> {
    const rows = await this.repo.find({
      where: { userId },
      order: { isPinned: 'DESC', updatedAt: 'DESC' },
    });
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<Note | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async save(note: Note): Promise<void> {
    await this.repo.save({ id: note.id, title: note.title, content: note.content, isPinned: note.isPinned, userId: note.userId });
  }

  async delete(id: string): Promise<void> { await this.repo.delete(id); }

  private toDomain(row: NoteOrmEntity): Note {
    return Note.reconstitute(row.id, row.title, row.content, row.isPinned, row.userId, row.createdAt, row.updatedAt);
  }
}
