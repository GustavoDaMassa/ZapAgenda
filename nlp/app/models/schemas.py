from pydantic import BaseModel
from typing import Any


class Message(BaseModel):
    role: str
    content: str


class ProcessRequest(BaseModel):
    jid: str
    text: str | None = None
    audio_base64: str | None = None
    history: list[Message] = []


class AppointmentEntities(BaseModel):
    title: str | None = None
    date: str | None = None
    time: str | None = None
    category: str | None = None
    recurrence: str | None = None


class TaskEntities(BaseModel):
    title: str | None = None
    description: str | None = None


class NoteEntities(BaseModel):
    title: str | None = None
    content: str | None = None


class ProcessResponse(BaseModel):
    intent: str
    entities: dict[str, Any] = {}
    reply_text: str
    needs_confirmation: bool
    session_state: str
