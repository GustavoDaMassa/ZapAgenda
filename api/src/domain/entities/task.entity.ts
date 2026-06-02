import { randomUUID } from 'crypto';

export interface CreateTaskInput {
  title: string;
  userId: string;
  description?: string;
}

export class Task {
  readonly id: string;
  title: string;
  description: string | null;
  isDone: boolean;
  readonly userId: string;
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(
    id: string, title: string, description: string | null,
    isDone: boolean, userId: string, createdAt: Date, updatedAt: Date,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.isDone = isDone;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(input: CreateTaskInput): Task {
    if (!input.title?.trim()) throw new Error('title is required');
    const now = new Date();
    return new Task(randomUUID(), input.title, input.description ?? null, false, input.userId, now, now);
  }

  static reconstitute(
    id: string, title: string, description: string | null,
    isDone: boolean, userId: string, createdAt: Date, updatedAt: Date,
  ): Task {
    return new Task(id, title, description, isDone, userId, createdAt, updatedAt);
  }

  isOwnedBy(userId: string): boolean { return this.userId === userId; }

  complete(): void { this.isDone = true; this.updatedAt = new Date(); }
  reopen(): void  { this.isDone = false; this.updatedAt = new Date(); }

  update(title: string, description: string | null): void {
    if (!title?.trim()) throw new Error('title is required');
    this.title = title;
    this.description = description;
    this.updatedAt = new Date();
  }
}
