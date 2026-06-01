import { randomUUID } from 'crypto';

export class User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  whatsappJid: string | null;

  private constructor(id: string, email: string, passwordHash: string, whatsappJid: string | null) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.whatsappJid = whatsappJid;
  }

  static create(email: string, passwordHash: string, whatsappJid?: string): User {
    if (!email) throw new Error('email is required');
    if (!passwordHash) throw new Error('passwordHash is required');
    return new User(randomUUID(), email, passwordHash, whatsappJid ?? null);
  }

  static reconstitute(id: string, email: string, passwordHash: string, whatsappJid: string | null): User {
    return new User(id, email, passwordHash, whatsappJid);
  }

  linkWhatsapp(jid: string): void {
    this.whatsappJid = jid;
  }
}
