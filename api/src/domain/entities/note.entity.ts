import { randomUUID } from 'crypto';

export interface CreateNoteInput {
  title: string;
  content: string;
  userId: string;
}

export class Note {
  readonly id: string;
  title: string;
  content: string;
  isPinned: boolean;
  readonly userId: string;
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(
    id: string, title: string, content: string,
    isPinned: boolean, userId: string, createdAt: Date, updatedAt: Date,
  ) {
    this.id = id; this.title = title; this.content = content;
    this.isPinned = isPinned; this.userId = userId;
    this.createdAt = createdAt; this.updatedAt = updatedAt;
  }

  static create(input: CreateNoteInput): Note {
    if (!input.title?.trim()) throw new Error('title is required');
    const now = new Date();
    return new Note(randomUUID(), input.title, input.content, false, input.userId, now, now);
  }

  static reconstitute(
    id: string, title: string, content: string,
    isPinned: boolean, userId: string, createdAt: Date, updatedAt: Date,
  ): Note {
    return new Note(id, title, content, isPinned, userId, createdAt, updatedAt);
  }

  isOwnedBy(userId: string): boolean { return this.userId === userId; }
  pin(): void   { this.isPinned = true;  this.updatedAt = new Date(); }
  unpin(): void { this.isPinned = false; this.updatedAt = new Date(); }

  update(title: string, content: string): void {
    if (!title?.trim()) throw new Error('title is required');
    this.title = title; this.content = content; this.updatedAt = new Date();
  }
}
