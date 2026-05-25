import os

from fastapi import FastAPI

from app.routers.process import router
from app.services.gemini import GeminiClient, INlpClient

app = FastAPI(title="ZapAgenda NLP", version="0.1.0")
app.include_router(router)

nlp_client: INlpClient = GeminiClient(api_key=os.environ["GEMINI_API_KEY"])


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
