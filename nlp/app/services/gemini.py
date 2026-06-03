import json
from abc import ABC, abstractmethod
from datetime import datetime

import google.generativeai as genai

from app.models.schemas import AppointmentEntities, TaskEntities, NoteEntities, ProcessResponse
from app.services.session import Session


class INlpClient(ABC):
    @abstractmethod
    async def process(
        self, text: str | None, audio_base64: str | None, session: Session
    ) -> ProcessResponse:
        pass


def build_system_prompt() -> str:
    hoje = datetime.now()
    dia_semana = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira",
                  "sexta-feira", "sábado", "domingo"][hoje.weekday()]
    data_str = hoje.strftime(f"%d/%m/%Y ({dia_semana})")

    return f"""Você é um assistente pessoal via WhatsApp que gerencia compromissos, tarefas e notas.
Data e hora atual: {data_str}. Fuso horário: America/Sao_Paulo (UTC-3).
Sempre resolva datas relativas (amanhã, sexta, semana que vem) com base nessa data.

Analise a mensagem do usuário e responda APENAS com JSON válido, sem markdown, no formato:

{{
  "intent": "<intent>",
  "entities": {{ <campos conforme o intent> }},
  "reply_text": "<resposta em português natural para o usuário>",
  "needs_confirmation": <true|false>,
  "session_state": "<idle|awaiting_clarification|awaiting_confirmation>"
}}

## Intents disponíveis e seus campos de entities:

### Compromissos:
- create_appointment  → {{ title, date (YYYY-MM-DD), time (HH:MM), category, recurrence (daily|weekly|monthly|null) }}
- query_appointments  → {{ date (YYYY-MM-DD ou null para "todos") }}
- edit_appointment    → {{ title, date, time, category }}
- cancel_appointment  → {{ title, date, time }}  [needs_confirmation: true]
- reschedule          → {{ title, old_date, new_date, new_time }} [needs_confirmation: true]

### Tarefas:
- create_task   → {{ title, description }}
- list_tasks    → {{}}
- complete_task → {{ title }}

### Notas:
- create_note → {{ title, content }}
- list_notes  → {{}}
- pin_note    → {{ title }}

### Fallback:
- unknown → {{}}  (quando não entender — reply_text pede reformulação)

## Regras:
- needs_confirmation: true apenas para ações destrutivas (cancelar, remarcar, concluir tarefa)
- session_state: awaiting_clarification quando faltar informação obrigatória
- session_state: awaiting_confirmation quando needs_confirmation = true
- session_state: idle para consultas e criações sem ambiguidade
- Se o histórico indicar confirmação pendente, execute a ação confirmada
"""


def _parse_entities(intent: str, raw: dict) -> AppointmentEntities | TaskEntities | NoteEntities | dict:
    if intent in ("create_appointment", "query_appointments", "edit_appointment",
                  "cancel_appointment", "reschedule"):
        return AppointmentEntities(**{k: raw.get(k) for k in AppointmentEntities.model_fields})
    if intent in ("create_task", "list_tasks", "complete_task"):
        return TaskEntities(**{k: raw.get(k) for k in TaskEntities.model_fields})
    if intent in ("create_note", "list_notes", "pin_note"):
        return NoteEntities(**{k: raw.get(k) for k in NoteEntities.model_fields})
    return raw


class GeminiClient(INlpClient):
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash") -> None:
        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(model_name)

    async def process(
        self, text: str | None, audio_base64: str | None, session: Session
    ) -> ProcessResponse:
        history_ctx = "\n".join(
            f"{m['role']}: {m['content']}" for m in session.history[-10:]
        )
        system_prompt = build_system_prompt()
        prompt = f"{system_prompt}\n\nHistórico da conversa:\n{history_ctx}\n\nMensagem atual: {text or '[áudio]'}"

        parts: list = [prompt]
        if audio_base64:
            parts.append({"mime_type": "audio/ogg", "data": audio_base64})

        response = await self._model.generate_content_async(parts)
        raw_text = response.text.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        data = json.loads(raw_text)
        intent = data.get("intent", "unknown")
        entities = _parse_entities(intent, data.get("entities", {}))

        return ProcessResponse(
            intent=intent,
            entities=entities,
            reply_text=data.get("reply_text", "Não entendi. Pode reformular?"),
            needs_confirmation=data.get("needs_confirmation", False),
            session_state=data.get("session_state", "idle"),
        )
