import json
from abc import ABC, abstractmethod

import google.generativeai as genai

from app.models.schemas import AppointmentEntities, ProcessResponse
from app.services.session import Session


class INlpClient(ABC):
    @abstractmethod
    async def process(
        self, text: str | None, audio_base64: str | None, session: Session
    ) -> ProcessResponse:
        pass


SYSTEM_PROMPT = """
Você é um assistente de agendamento via WhatsApp. Analise a mensagem e responda em JSON com:
- intent: create_appointment | query_appointments | edit_appointment | cancel_appointment | reschedule | unknown
- entities: { title, date (YYYY-MM-DD), time (HH:MM), category, recurrence }
- reply_text: resposta em português para o usuário
- needs_confirmation: true se a ação é destrutiva (cancelar, remarcar)
- session_state: idle | awaiting_clarification | awaiting_confirmation

Fuso horário: America/Sao_Paulo. Datas relativas (sexta, amanhã) devem ser resolvidas.
Responda APENAS com JSON válido, sem markdown.
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
        prompt = f"{SYSTEM_PROMPT}\n\nHistórico:\n{history_ctx}\n\nMensagem atual: {text or '[áudio]'}"

        parts: list = [prompt]
        if audio_base64:
            parts.append({"mime_type": "audio/ogg", "data": audio_base64})

        response = await self._model.generate_content_async(parts)
        raw = response.text.strip()

        data = json.loads(raw)
        return ProcessResponse(
            intent=data.get("intent", "unknown"),
            entities=AppointmentEntities(**data.get("entities", {})),
            reply_text=data.get("reply_text", "Não entendi. Pode reformular?"),
            needs_confirmation=data.get("needs_confirmation", False),
            session_state=data.get("session_state", "idle"),
        )
