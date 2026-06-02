FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir \
    fastapi>=0.115.0 \
    "uvicorn[standard]>=0.30.0" \
    pydantic>=2.7.0 \
    pydantic-settings>=2.3.0 \
    google-generativeai>=0.7.0 \
    httpx>=0.27.0

COPY app/ app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
