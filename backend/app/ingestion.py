import json
import re
import uuid
from datetime import UTC, datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

import requests
import google.generativeai as genai

from .embeddings import cosine, dumps, embed_query, embed_text, loads, tokenize
from .settings import get_settings

_WHISPER_MODELS: dict[str, Any] = {}


class ReadableHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self._in_title = False
        self._skip_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style", "noscript", "svg"}:
            self._skip_depth += 1
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript", "svg"} and self._skip_depth:
            self._skip_depth -= 1
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        text = " ".join(data.split())
        if not text:
            return
        if self._in_title:
            self.title = f"{self.title} {text}".strip()
        elif not self._skip_depth:
            self.parts.append(text)

    @property
    def readable_text(self) -> str:
        return "\n".join(self.parts)


def now_iso() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def normalize_tags(tags: list[str] | str | None) -> list[str]:
    if not tags:
        return []
    if isinstance(tags, str):
        tags = tags.split(",")
    normalized = []
    seen = set()
    for tag in tags:
        clean = re.sub(r"\s+", "-", tag.strip().lower()).strip("-")
        if clean and clean not in seen:
            normalized.append(clean)
            seen.add(clean)
    return normalized


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 160) -> list[str]:
    clean = re.sub(r"\s+", " ", text).strip()
    if not clean:
        return []
    chunks = []
    start = 0
    while start < len(clean):
        end = min(len(clean), start + chunk_size)
        if end < len(clean):
            boundary = clean.rfind(".", start, end)
            if boundary > start + chunk_size // 2:
                end = boundary + 1
        chunks.append(clean[start:end].strip())
        if end >= len(clean):
            break
        start = max(0, end - overlap)
    return chunks


def infer_title(content: str, fallback: str = "Untitled Memory") -> str:
    first_line = next((line.strip() for line in content.splitlines() if line.strip()), "")
    if not first_line:
        return fallback
    return first_line[:90]


def summarize(content: str) -> str:
    settings = get_settings()
    text = re.sub(r"\s+", " ", content).strip()
    if not text:
        return "No readable text was extracted."

    if settings.gemini_api_key:
        try:
            # Google AI Studio SDK best-practice flow:
            # genai.configure(api_key=...)
            # model = genai.GenerativeModel("gemma-4-26b-a4b-it")
            # response = model.generate_content(...)
            genai.configure(api_key=settings.gemini_api_key)
            model = genai.GenerativeModel(settings.gemini_model)
            response = model.generate_content(
                "Summarize this memory in two concise sentences for a second brain.\n\n"
                f"{text[:6000]}",
                generation_config={"temperature": 0.2, "max_output_tokens": 180},
            )
            content_text = (response.text or "").strip()
            if content_text:
                return content_text
        except Exception:
            pass

    # Local model path intentionally disabled while Gemma API is active.
    # if settings.llama_base_url:
    #     try:
    #         response = requests.post(
    #             f"{settings.llama_base_url.rstrip('/')}/v1/chat/completions",
    #             json={
    #                 "model": settings.llama_model,
    #                 "messages": [
    #                     {
    #                         "role": "system",
    #                         "content": "Summarize this memory in two concise sentences for a local second brain.",
    #                     },
    #                     {"role": "user", "content": text[:6000]},
    #                 ],
    #                 "temperature": 0.2,
    #                 "max_tokens": 180,
    #             },
    #             timeout=30,
    #         )
    #         response.raise_for_status()
    #         content_text = response.json()["choices"][0]["message"]["content"].strip()
    #         if content_text:
    #             return content_text
    #     except Exception:
    #         pass

    sentences = re.split(r"(?<=[.!?])\s+", text)
    return " ".join(sentences[:2])[:500]


def extract_url(url: str) -> tuple[str, str]:
    request = Request(url, headers={"User-Agent": "BrainDumpLocal/0.1"})
    with urlopen(request, timeout=20) as response:
        raw = response.read(2_000_000)
        charset = response.headers.get_content_charset() or "utf-8"
    html = raw.decode(charset, errors="ignore")
    parser = ReadableHTMLParser()
    parser.feed(html)
    title = parser.title or url
    return title[:140], parser.readable_text[:80_000]


def transcribe_with_whisper(path: Path) -> str:
    settings = get_settings()
    try:
        import whisper

        model_name = settings.whisper_model or "base"
        model = _WHISPER_MODELS.get(model_name)
        if model is None:
            model = whisper.load_model(model_name)
            _WHISPER_MODELS[model_name] = model

        transcribe_args: dict[str, Any] = {}
        if settings.whisper_language:
            transcribe_args["language"] = settings.whisper_language

        result = model.transcribe(str(path), **transcribe_args)
        text = (result.get("text") or "").strip()
        if text:
            return text
        return "Transcription completed, but no speech was detected."
    except Exception as exc:
        return (
            f"Whisper transcription is unavailable for {path.name}. "
            f"Install/configure whisper + ffmpeg. Details: {exc}"
        )


def extract_file(path: Path, original_name: str) -> tuple[str, str, str]:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        try:
            from pypdf import PdfReader

            reader = PdfReader(str(path))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
            return "pdf", Path(original_name).stem, text
        except Exception as exc:
            return "pdf", Path(original_name).stem, f"PDF text extraction failed: {exc}"

    if suffix in {".png", ".jpg", ".jpeg", ".webp"}:
        try:
            import pytesseract
            from PIL import Image

            settings = get_settings()
            configured_tesseract = Path(settings.tesseract_cmd)
            if configured_tesseract.exists():
                pytesseract.pytesseract.tesseract_cmd = str(configured_tesseract)

            text = pytesseract.image_to_string(Image.open(path))
            return "screenshot", Path(original_name).stem, text
        except Exception as exc:
            return "screenshot", Path(original_name).stem, f"OCR is not configured yet for this image. Saved file: {original_name}. Details: {exc}"

    if suffix in {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac"}:
        text = transcribe_with_whisper(path)
        return "text", Path(original_name).stem, text

    if suffix in {".mp4", ".mov", ".mkv", ".webm"}:
        text = transcribe_with_whisper(path)
        return "youtube", Path(original_name).stem, text

    return "text", Path(original_name).stem, path.read_text(encoding="utf-8", errors="ignore")


def memory_row_to_dict(row, connection_ids: list[str], relevance: float | None = None) -> dict:
    return {
        "id": row["id"],
        "type": row["type"],
        "title": row["title"],
        "content": row["content"],
        "summary": row["summary"],
        "source": row["source"],
        "sourceUrl": row["source_url"],
        "thumbnail": row["thumbnail"],
        "tags": json.loads(row["tags_json"]),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
        "status": row["status"],
        "connections": connection_ids,
        "relevanceScore": relevance,
    }


def add_activity(conn, activity_type: str, description: str, memory_id: str | None = None) -> None:
    conn.execute(
        "INSERT INTO activity (id, type, description, memory_id, timestamp) VALUES (?, ?, ?, ?, ?)",
        (new_id("act"), activity_type, description, memory_id, now_iso()),
    )


def save_memory(
    conn,
    *,
    memory_type: str,
    title: str,
    content: str,
    tags: list[str],
    source: str | None = None,
    source_url: str | None = None,
    thumbnail: str | None = None,
) -> dict:
    timestamp = now_iso()
    memory_id = new_id("mem")
    summary = summarize(content)
    clean_tags = normalize_tags(tags)

    conn.execute(
        """
        INSERT INTO memories
          (id, type, title, content, summary, source, source_url, thumbnail, tags_json, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'indexed', ?, ?)
        """,
        (
            memory_id,
            memory_type,
            title or infer_title(content),
            content,
            summary,
            source,
            source_url,
            thumbnail,
            json.dumps(clean_tags),
            timestamp,
            timestamp,
        ),
    )

    for index, chunk in enumerate(chunk_text(content) or [content[:900]]):
        conn.execute(
            "INSERT INTO chunks (id, memory_id, chunk_index, text, embedding_json) VALUES (?, ?, ?, ?, ?)",
            (new_id("chk"), memory_id, index, chunk, dumps(embed_text(chunk))),
        )

    add_activity(conn, "capture", f'Added "{title or infer_title(content)}"', memory_id)
    discover_connections(conn, memory_id)
    row = conn.execute("SELECT * FROM memories WHERE id = ?", (memory_id,)).fetchone()
    connection_ids = get_connection_ids(conn, memory_id)
    return memory_row_to_dict(row, connection_ids)


def get_connection_ids(conn, memory_id: str) -> list[str]:
    rows = conn.execute(
        """
        SELECT CASE WHEN source_id = ? THEN target_id ELSE source_id END AS related_id
        FROM connections
        WHERE source_id = ? OR target_id = ?
        ORDER BY strength DESC
        """,
        (memory_id, memory_id, memory_id),
    ).fetchall()
    return [row["related_id"] for row in rows]


def average_embedding(conn, memory_id: str) -> list[float]:
    rows = conn.execute("SELECT embedding_json FROM chunks WHERE memory_id = ?", (memory_id,)).fetchall()
    vectors = [loads(row["embedding_json"]) for row in rows]
    if not vectors:
        return embed_text("")
    dims = len(vectors[0])
    avg = [sum(vector[i] for vector in vectors) / len(vectors) for i in range(dims)]
    length = sum(value * value for value in avg) ** 0.5
    return [value / length for value in avg] if length else avg


def describe_relation(source_title: str, target_title: str, strength: float) -> str:
    percent = round(strength * 100)
    return f'Local embeddings found a {percent}% semantic overlap between "{source_title}" and "{target_title}".'


def discover_connections(conn, memory_id: str, threshold: float = 0.24, limit: int = 6) -> None:
    source = conn.execute("SELECT id, title FROM memories WHERE id = ?", (memory_id,)).fetchone()
    if not source:
        return
    source_embedding = average_embedding(conn, memory_id)
    candidates = conn.execute("SELECT id, title FROM memories WHERE id != ?", (memory_id,)).fetchall()
    scored = []
    for candidate in candidates:
        score = cosine(source_embedding, average_embedding(conn, candidate["id"]))
        if score >= threshold:
            scored.append((score, candidate))

    for score, candidate in sorted(scored, reverse=True, key=lambda item: item[0])[:limit]:
        source_id, target_id = sorted([memory_id, candidate["id"]])
        relation = "similar" if score >= 0.48 else "related"
        conn.execute(
            """
            INSERT OR IGNORE INTO connections
              (id, source_id, target_id, strength, relationship_type, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                new_id("conn"),
                source_id,
                target_id,
                float(score),
                relation,
                describe_relation(source["title"], candidate["title"], score),
                now_iso(),
            ),
        )


def search(conn, query: str, tag: str | None = None, limit: int = 20) -> list[dict]:
    settings = get_settings()
    query_embedding = embed_query(query)
    query_tokens = set(tokenize(query))
    memories = conn.execute("SELECT * FROM memories WHERE status = 'indexed'").fetchall()
    scored: dict[str, tuple[float, set[str]]] = {}

    for memory in memories:
        tags = json.loads(memory["tags_json"])
        if tag and tag not in tags:
            continue
        chunks = conn.execute("SELECT text, embedding_json FROM chunks WHERE memory_id = ?", (memory["id"],)).fetchall()
        best_score = 0.0
        matched = set()
        for chunk in chunks:
            vector_score = max(0.0, cosine(query_embedding, loads(chunk["embedding_json"])))
            overlap = query_tokens.intersection(tokenize(chunk["text"]))
            lexical_score = min(len(overlap) / max(len(query_tokens), 1), 1.0)
            score = 0.75 * vector_score + 0.25 * lexical_score
            if score > best_score:
                best_score = score
                matched = overlap
        if query.lower() in memory["title"].lower():
            best_score += 0.2
        if best_score >= settings.search_min_score:
            scored[memory["id"]] = (min(best_score, 1.0), matched)

    results = []
    for memory_id, (score, matched) in sorted(scored.items(), key=lambda item: item[1][0], reverse=True)[:limit]:
        row = conn.execute("SELECT * FROM memories WHERE id = ?", (memory_id,)).fetchone()
        item = memory_row_to_dict(row, get_connection_ids(conn, memory_id), score)
        item["matchScore"] = score
        item["matchedSegments"] = sorted(matched)[:8] or [query]
        results.append(item)
    add_activity(conn, "search", f'Searched for "{query}"')
    return results
