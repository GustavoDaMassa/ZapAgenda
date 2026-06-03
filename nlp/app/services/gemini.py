import json
from abc import ABC, abstractmethod
from datetime import datetime
from zoneinfo import ZoneInfo

import google.generativeai as genai

from app.models.schemas import ProcessResponse
from app.services.session import Session

TZ_BR = ZoneInfo("America/Sao_Paulo")

DIAS_SEMANA = [
    "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado", "domingo",
]
MESES = [
    "", "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]


class INlpClient(ABC):
    @abstractmethod
    async def process(
        self, text: str | None, audio_base64: str | None, session: Session
    ) -> ProcessResponse:
        pass


def build_system_prompt() -> str:
    agora = datetime.now(TZ_BR)
    dia_semana = DIAS_SEMANA[agora.weekday()]
    mes = MESES[agora.month]
    data_iso = agora.strftime("%Y-%m-%d")
    data_legivel = f"{agora.day} de {mes} de {agora.year} ({dia_semana})"

    return f"""Você é um assistente pessoal via WhatsApp que gerencia compromissos, tarefas e notas.

DATA DE HOJE: {data_legivel}
DATA ISO: {data_iso}
FUSO HORÁRIO: America/Sao_Paulo (UTC-3)

Use essas datas como referência absoluta ao resolver expressões como "amanhã", "sexta", "semana que vem".
Amanhã é SEMPRE a data de hoje + 1 dia = {(agora.replace(hour=0,minute=0,second=0) + __import__('datetime').timedelta(days=1)).strftime('%Y-%m-%d')}.

Analise a mensagem e responda APENAS com JSON válido, sem markdown:

{{
  "intent": "<intent>",
  "entities": {{ <campos conforme o intent> }},
  "reply_text": "<resposta em português natural>",
  "needs_confirmation": <true|false>,
  "session_state": "<idle|awaiting_clarification|awaiting_confirmation>"
}}

INTENTS E ENTITIES:

Compromissos:
  create_appointment  → {{ "title": str, "date": "YYYY-MM-DD", "time": "HH:MM", "category": str|null, "recurrence": "daily"|"weekly"|"monthly"|null }}
  query_appointments  → {{ "date": "YYYY-MM-DD"|null }}
  edit_appointment    → {{ "title": str, "date": "YYYY-MM-DD", "time": "HH:MM", "category": str|null }}
  cancel_appointment  → {{ "title": str, "date": "YYYY-MM-DD"|null, "time": "HH:MM"|null }}  [needs_confirmation: true]
  reschedule          → {{ "title": str, "old_date": "YYYY-MM-DD", "new_date": "YYYY-MM-DD", "new_time": "HH:MM" }} [needs_confirmation: true]

Tarefas:
  create_task   → {{ "title": str, "description": str|null }}
  list_tasks    → {{}}
  complete_task → {{ "title": str }} [needs_confirmation: true]

Notas:
  create_note → {{ "title": str, "content": str }}
  list_notes  → {{}}
  pin_note    → {{ "title": str }}

Fallback:
  unknown → {{}}

REGRAS:
- needs_confirmation: true apenas para cancel_appointment, reschedule, complete_task
- awaiting_clarification quando faltam campos obrigatórios (ex: create_appointment sem horário)
- awaiting_confirmation quando needs_confirmation = true
- idle para tudo mais
- Se histórico mostrar confirmação pendente, execute a ação
"""


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
        prompt = (
            f"{build_system_prompt()}\n\n"
            f"Histórico:\n{history_ctx}\n\n"
            f"Mensagem atual: {text or '[áudio]'}"
        )

        parts: list = [prompt]
        if audio_base64:
            parts.append({"mime_type": "audio/ogg", "data": audio_base64})

        response = await self._model.generate_content_async(parts)
        raw = response.text.strip()

        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        data = json.loads(raw)

        return ProcessResponse(
            intent=data.get("intent", "unknown"),
            entities=data.get("entities", {}),
            reply_text=data.get("reply_text", "Não entendi. Pode reformular?"),
            needs_confirmation=data.get("needs_confirmation", False),
            session_state=data.get("session_state", "idle"),
        )
