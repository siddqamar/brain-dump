# Brain Dump Backend

Local-first FastAPI backend for the hackathon MVP.

## Why SQLite first?

Postgres + pgvector is the right long-term path, but the MVP needs to be easy on Windows. This backend starts with SQLite and deterministic local embeddings so judges can run it without Docker, accounts, or cloud services. The API shape is intentionally compatible with a future pgvector swap.

## Quickstart

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8765
```

The API runs at `http://127.0.0.1:8765`.

## Optional llama.cpp summarization

If your llama.cpp server exposes an OpenAI-compatible chat endpoint, create `backend/.env`:

```env
BRAIN_LLAMA_BASE_URL=http://127.0.0.1:8080
BRAIN_LLAMA_MODEL=lfm-local
```

Without this, summaries use a fast local extractive fallback.

## Important endpoints

- `POST /api/capture/text`
- `POST /api/capture/url`
- `POST /api/capture/file`
- `GET /api/search?q=...`
- `GET /api/memories`
- `GET /api/memories/{id}`
- `GET /api/connections`
- `GET /api/insights`
- `GET /api/status`

## Upgrade path

For a more scalable version, keep the FastAPI routes and replace `app/embeddings.py` plus the `chunks.embedding_json` storage with:

- Postgres tables
- `pgvector` column type
- local embedding model such as `nomic-embed-text`, `bge-small`, or a llama.cpp embedding endpoint
- background workers for OCR, PDF extraction, and connection refresh
