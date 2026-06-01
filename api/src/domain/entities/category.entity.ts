import { randomUUID } from 'crypto';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export class Category {
  readonly id: string;
  name: string;
  color: string;
  defaultReminderMinutes: number | null;
  readonly isSystem: boolean;
  readonly userId: string | null;

  private constructor(
    id: string,
    name: string,
    color: string,
    defaultReminderMinutes: number | null,
    isSystem: boolean,
    userId: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.defaultReminderMinutes = defaultReminderMinutes;
    this.isSystem = isSystem;
    this.userId = userId;
  }

  private static validate(name: string, color: string): void {
    if (!name?.trim()) throw new Error('name is required');
    if (!HEX_COLOR.test(color)) throw new Error(`invalid hex color: ${color}`);
  }

  static create(name: string, color: string, userId: string, defaultReminderMinutes?: number): Category {
    Category.validate(name, color);
    return new Category(randomUUID(), name, color, defaultReminderMinutes ?? null, false, userId);
  }

  static createSystem(name: string, color: string, defaultReminderMinutes?: number): Category {
    Category.validate(name, color);
    return new Category(randomUUID(), name, color, defaultReminderMinutes ?? null, true, null);
  }

  static reconstitute(
    id: string,
    name: string,
    color: string,
    defaultReminderMinutes: number | null,
    isSystem: boolean,
    userId: string | null,
  ): Category {
    return new Category(id, name, color, defaultReminderMinutes, isSystem, userId);
  }

  isDeletable(): boolean {
    return !this.isSystem;
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  update(name: string, color: string, defaultReminderMinutes?: number | null): void {
    Category.validate(name, color);
    this.name = name;
    this.color = color;
    this.defaultReminderMinutes = defaultReminderMinutes ?? this.defaultReminderMinutes;
  }
}
