import { randomUUID } from 'crypto';

export class User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;

  private constructor(id: string, email: string, passwordHash: string) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  static create(email: string, passwordHash: string): User {
    if (!email) throw new Error('email is required');
    if (!passwordHash) throw new Error('passwordHash is required');
    return new User(randomUUID(), email, passwordHash);
  }

  static reconstitute(id: string, email: string, passwordHash: string): User {
    return new User(id, email, passwordHash);
  }
}
