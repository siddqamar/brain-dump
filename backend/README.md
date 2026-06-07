# Brain Dump Backend

Local-first FastAPI backend for the hackathon MVP.

## Why SQLite first?

Postgres + pgvector is the right long-term path, but the MVP needs to be easy on Windows. This backend starts with SQLite and deterministic local embeddings so judges can run it without Docker, accounts, or cloud services. The API shape is intentionally compatible with a future pgvector swap.

## Quickstart

```powershell
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8765
```

The API runs at `http://127.0.0.1:8765`.

The backend now uses `pyproject.toml` as the source of truth for dependencies. `requirements.txt` is kept only as a temporary legacy file during migration.

## Gemma + Whisper config

Create `backend/app/.env`:

```env
BRAIN_GEMINI_API_KEY=your_api_key_here
BRAIN_GEMINI_MODEL=gemma-4-26b-a4b-it
BRAIN_EMBEDDING_PROVIDER=local
BRAIN_GEMINI_EMBEDDING_MODEL=text-embedding-004
BRAIN_WHISPER_MODEL=base
BRAIN_WHISPER_LANGUAGE=
BRAIN_TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
BRAIN_SEARCH_MIN_SCORE=0.18
```

How it works:
- Summaries use Gemma through Google AI Studio API when `BRAIN_GEMINI_API_KEY` is set.
- Embeddings default to local deterministic vectors for offline MVP speed.
- Set `BRAIN_EMBEDDING_PROVIDER=gemini` to use Google embeddings.
- Audio/video uploads use Whisper transcription (requires ffmpeg on the machine).
- Image OCR uses Tesseract via `BRAIN_TESSERACT_CMD` (default points to standard Windows install path).
- `BRAIN_SEARCH_MIN_SCORE` controls result strictness (higher = fewer, cleaner matches).
- If providers are unavailable, the backend falls back gracefully so ingestion still works.

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
