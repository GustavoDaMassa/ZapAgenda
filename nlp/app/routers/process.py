from fastapi import APIRouter, Depends

from app.models.schemas import ProcessRequest, ProcessResponse
from app.services.gemini import INlpClient
from app.services.session import session_store

router = APIRouter()


def get_nlp_client() -> INlpClient:
    from app.main import nlp_client
    return nlp_client


@router.post("/process", response_model=ProcessResponse)
async def process_message(
    body: ProcessRequest,
    client: INlpClient = Depends(get_nlp_client),
) -> ProcessResponse:
    session = session_store.get_or_create(body.jid)

    if body.text:
        session.add_message("user", body.text)

    response = await client.process(body.text, body.audio_base64, session)

    session.add_message("bot", response.reply_text)
    session.state = response.session_state

    if response.session_state == "idle":
        session.reset()

    return response
