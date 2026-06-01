export interface ConversationMessage {
  role: 'user' | 'bot';
  content: string;
}

interface Session {
  history: ConversationMessage[];
  pendingIntent: string | null;
  pendingEntities: Record<string, unknown>;
  lastActivity: Date;
}

const SESSION_TTL_MS = 5 * 60 * 1000;

export class SessionStore {
  private readonly sessions = new Map<string, Session>();

  getOrCreate(jid: string): Session {
    this.cleanup();
    if (!this.sessions.has(jid)) {
      this.sessions.set(jid, { history: [], pendingIntent: null, pendingEntities: {}, lastActivity: new Date() });
    }
    const session = this.sessions.get(jid)!;
    session.lastActivity = new Date();
    return session;
  }

  addMessage(jid: string, role: 'user' | 'bot', content: string): void {
    const session = this.getOrCreate(jid);
    session.history.push({ role, content });
    if (session.history.length > 20) session.history.splice(0, session.history.length - 20);
  }

  setPending(jid: string, intent: string, entities: Record<string, unknown>): void {
    const session = this.getOrCreate(jid);
    session.pendingIntent = intent;
    session.pendingEntities = entities;
  }

  clearPending(jid: string): void {
    const session = this.getOrCreate(jid);
    session.pendingIntent = null;
    session.pendingEntities = {};
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [jid, session] of this.sessions) {
      if (now - session.lastActivity.getTime() > SESSION_TTL_MS) this.sessions.delete(jid);
    }
  }
}
