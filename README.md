# Brain Dump

Local-first second brain MVP for the hackathon: capture text, URLs, PDFs, and images; extract text; build local embeddings; discover connections; and search semantically.

## MVP Architecture

- Frontend: Next/React app in `brain-dump-frontend`
- Backend: FastAPI app in `backend`
- Storage: SQLite in `backend/data` by default
- Embeddings: deterministic local hashed vectors for zero-setup MVP search
- Optional local LLM: llama.cpp OpenAI-compatible chat endpoint for better summaries

Postgres + pgvector is still the recommended production direction. For the hackathon, SQLite keeps the demo lightweight for Windows users and preserves an easy migration path because the API contract is separate from the storage implementation.

## Start Backend

```cmd
start-backend.cmd
```

Or manually:

```cmd
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8765
```

## Start Frontend

```cmd
start-frontend.cmd
```

If dependencies are not installed yet:

```cmd
cd brain-dump-frontend
npm.cmd install
npm.cmd run dev
```

The frontend reads `NEXT_PUBLIC_API_URL` and defaults to `http://127.0.0.1:8765`.

## Optional llama.cpp Summaries

Create `backend\.env`:

```env
BRAIN_LLAMA_BASE_URL=http://127.0.0.1:8080
BRAIN_LLAMA_MODEL=lfm-local
```

The backend still works without this. It falls back to a local extractive summary.

## Hackathon Demo Flow

1. Start the backend and frontend.
2. Open Capture and add a note or URL.
3. Add another related note.
4. Use Semantic Search with natural language.
5. Open Connections to show the local knowledge graph.
6. Open Insights to show generated clusters and suggestions.

## API

- `POST /api/capture/text`
- `POST /api/capture/url`
- `POST /api/capture/file`
- `GET /api/search?q=...`
- `GET /api/memories`
- `GET /api/memories/{id}`
- `GET /api/connections`
- `GET /api/insights`
- `GET /api/status`
