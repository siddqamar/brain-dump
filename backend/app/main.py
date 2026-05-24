import json
import shutil
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .db import get_db, init_db
from .ingestion import (
    add_activity,
    extract_file,
    extract_url,
    get_connection_ids,
    memory_row_to_dict,
    new_id,
    normalize_tags,
    now_iso,
    save_memory,
    search,
)
from .schemas import TextCaptureRequest, UrlCaptureRequest
from .settings import get_settings

app = FastAPI(title="Brain Dump Local API", version="0.1.0")
settings = get_settings()

SUPPORTED_UPLOAD_TYPES = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".txt",
    ".md",
    ".json",
    ".csv",
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".html",
    ".css",
    ".sql",
    ".mp3",
    ".wav",
    ".m4a",
    ".ogg",
    ".flac",
    ".aac",
    ".mp4",
    ".mov",
    ".mkv",
    ".webm",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> dict:
    return {"ok": True, "app": settings.app_name}


@app.get("/api/status")
def status(conn=Depends(get_db)) -> dict:
    total_memories = conn.execute("SELECT COUNT(*) AS count FROM memories").fetchone()["count"]
    total_connections = conn.execute("SELECT COUNT(*) AS count FROM connections").fetchone()["count"]
    last_activity = conn.execute("SELECT timestamp FROM activity ORDER BY timestamp DESC LIMIT 1").fetchone()
    db_size = settings.database_path.stat().st_size if settings.database_path.exists() else 0
    upload_size = sum(path.stat().st_size for path in settings.upload_dir.rglob("*") if path.is_file())
    return {
        "localAIActive": bool(settings.gemini_api_key or settings.llama_base_url),
        "processingQueue": 0,
        "totalMemories": total_memories,
        "totalConnections": total_connections,
        "lastSync": last_activity["timestamp"] if last_activity else now_iso(),
        "storageUsed": round((db_size + upload_size) / (1024**3), 3),
        "storageTotal": 10,
    }


@app.get("/api/memories")
def list_memories(type: str | None = None, tag: str | None = None, conn=Depends(get_db)) -> list[dict]:
    rows = conn.execute("SELECT * FROM memories ORDER BY created_at DESC").fetchall()
    items = []
    for row in rows:
        tags = json.loads(row["tags_json"])
        if type and type != "all" and row["type"] != type:
            continue
        if tag and tag not in tags:
            continue
        items.append(memory_row_to_dict(row, get_connection_ids(conn, row["id"])))
    return items


@app.get("/api/memories/{memory_id}")
def get_memory(memory_id: str, conn=Depends(get_db)) -> dict:
    row = conn.execute("SELECT * FROM memories WHERE id = ?", (memory_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Memory not found")
    memory = memory_row_to_dict(row, get_connection_ids(conn, memory_id))
    connections = list_connections(memory_id=memory_id, conn=conn)
    related = []
    for related_id in memory["connections"][:8]:
        related_row = conn.execute("SELECT * FROM memories WHERE id = ?", (related_id,)).fetchone()
        if related_row:
            related.append(memory_row_to_dict(related_row, get_connection_ids(conn, related_id)))
    return {"memory": memory, "connections": connections, "relatedMemories": related}


@app.delete("/api/memories/{memory_id}")
def delete_memory(memory_id: str, conn=Depends(get_db)) -> dict:
    row = conn.execute("SELECT title FROM memories WHERE id = ?", (memory_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Memory not found")
    conn.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
    add_activity(conn, "capture", f'Deleted "{row["title"]}"')
    conn.commit()
    return {"ok": True}


@app.post("/api/capture/text")
def capture_text(payload: TextCaptureRequest, conn=Depends(get_db)) -> dict:
    memory = save_memory(
        conn,
        memory_type="text",
        title=payload.title or "Untitled Note",
        content=payload.content,
        tags=payload.tags,
        source="Text Note",
    )
    conn.commit()
    return memory


@app.post("/api/capture/url")
def capture_url(payload: UrlCaptureRequest, conn=Depends(get_db)) -> dict:
    url = str(payload.url)
    try:
        title, content = extract_url(url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read URL: {exc}") from exc
    memory = save_memory(
        conn,
        memory_type=payload.type,
        title=title,
        content=content or url,
        tags=payload.tags,
        source="YouTube" if payload.type == "youtube" else "Web",
        source_url=url,
    )
    conn.commit()
    return memory


@app.post("/api/capture/file")
def capture_file(
    file: UploadFile = File(...),
    tags: str = Form(""),
    conn=Depends(get_db),
) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")
    suffix = Path(file.filename).suffix.lower()
    if suffix not in SUPPORTED_UPLOAD_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    destination = settings.upload_dir / f"{new_id('upload')}{suffix}"
    with destination.open("wb") as output:
        shutil.copyfileobj(file.file, output)

    if destination.stat().st_size > settings.max_file_mb * 1024 * 1024:
        destination.unlink(missing_ok=True)
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.max_file_mb}MB")

    memory_type, title, content = extract_file(destination, file.filename)
    memory = save_memory(
        conn,
        memory_type=memory_type,
        title=title,
        content=content,
        tags=normalize_tags(tags),
        source="Local File",
    )
    conn.commit()
    return memory


@app.get("/api/search")
def semantic_search(q: str, tag: str | None = None, limit: int = 20, conn=Depends(get_db)) -> list[dict]:
    if not q.strip() and tag:
        return list_memories(tag=tag, conn=conn)
    if not q.strip():
        return []
    results = search(conn, q, tag=tag, limit=limit)
    conn.commit()
    return results


@app.get("/api/tags")
def list_tags(conn=Depends(get_db)) -> list[dict]:
    counts: dict[str, int] = {}
    for row in conn.execute("SELECT tags_json FROM memories").fetchall():
        for tag in json.loads(row["tags_json"]):
            counts[tag] = counts.get(tag, 0) + 1
    return [{"name": tag, "count": count} for tag, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))]


@app.get("/api/connections")
def list_connections(memory_id: str | None = None, conn=Depends(get_db)) -> list[dict]:
    if memory_id:
        rows = conn.execute(
            "SELECT * FROM connections WHERE source_id = ? OR target_id = ? ORDER BY strength DESC",
            (memory_id, memory_id),
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM connections ORDER BY strength DESC").fetchall()
    return [
        {
            "id": row["id"],
            "sourceId": row["source_id"],
            "targetId": row["target_id"],
            "strength": row["strength"],
            "relationshipType": row["relationship_type"],
            "description": row["description"],
            "createdAt": row["created_at"],
        }
        for row in rows
    ]


@app.get("/api/insights")
def list_insights(conn=Depends(get_db)) -> list[dict]:
    tags = list_tags(conn)
    memories = list_memories(conn=conn)
    insights = []
    timestamp = now_iso()
    if tags:
        top = tags[0]
        related_ids = [memory["id"] for memory in memories if top["name"] in memory["tags"]][:5]
        insights.append(
            {
                "id": "ins-top-cluster",
                "title": f'{top["name"].replace("-", " ").title()} Cluster',
                "description": f'You have {top["count"]} memories around #{top["name"]}. This is a strong local knowledge cluster worth exploring.',
                "memoryIds": related_ids,
                "type": "cluster",
                "confidence": min(0.95, 0.55 + top["count"] * 0.08),
                "createdAt": timestamp,
                "actionable": True,
            }
        )
    if len(memories) < 5:
        insights.append(
            {
                "id": "ins-add-more",
                "title": "Add More Sources",
                "description": "The graph is still sparse. Add a few PDFs, links, or notes to make connection discovery more useful.",
                "memoryIds": [memory["id"] for memory in memories[:3]],
                "type": "suggestion",
                "confidence": 0.74,
                "createdAt": timestamp,
                "actionable": True,
            }
        )
    return insights


@app.post("/api/insights/refresh")
def refresh_insights(conn=Depends(get_db)) -> list[dict]:
    add_activity(conn, "insight", "Refreshed local insights")
    conn.commit()
    return list_insights(conn)


@app.get("/api/activity")
def list_activity(conn=Depends(get_db)) -> list[dict]:
    rows = conn.execute("SELECT * FROM activity ORDER BY timestamp DESC LIMIT 20").fetchall()
    return [
        {
            "id": row["id"],
            "type": row["type"],
            "description": row["description"],
            "memoryId": row["memory_id"],
            "timestamp": row["timestamp"],
        }
        for row in rows
    ]


@app.get("/api/export")
def export_data(conn=Depends(get_db)) -> dict:
    return {
        "memories": list_memories(conn=conn),
        "connections": list_connections(conn=conn),
        "insights": list_insights(conn=conn),
        "activity": list_activity(conn=conn),
    }
