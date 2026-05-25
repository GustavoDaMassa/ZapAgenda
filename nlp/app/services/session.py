from dataclasses import dataclass, field
from datetime import datetime, timedelta


@dataclass
class Session:
    jid: str
    state: str = "idle"
    pending_entities: dict = field(default_factory=dict)
    history: list[dict] = field(default_factory=list)
    expires_at: datetime = field(
        default_factory=lambda: datetime.utcnow() + timedelta(minutes=5)
    )

    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at

    def touch(self) -> None:
        self.expires_at = datetime.utcnow() + timedelta(minutes=5)

    def add_message(self, role: str, content: str) -> None:
        self.history.append({"role": role, "content": content})
        if len(self.history) > 20:
            self.history = self.history[-20:]
        self.touch()

    def reset(self) -> None:
        self.state = "idle"
        self.pending_entities = {}


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}

    def get_or_create(self, jid: str) -> Session:
        session = self._sessions.get(jid)
        if session is None or session.is_expired():
            session = Session(jid=jid)
            self._sessions[jid] = session
        return session

    def clear_expired(self) -> None:
        expired = [jid for jid, s in self._sessions.items() if s.is_expired()]
        for jid in expired:
            del self._sessions[jid]


session_store = SessionStore()
