import sqlite3
from collections.abc import Iterator

from .settings import get_settings


SCHEMA = """
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  thumbnail TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'indexed',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  embedding_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  strength REAL NOT NULL,
  relationship_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(source_id, target_id)
);

CREATE TABLE IF NOT EXISTS activity (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  memory_id TEXT,
  timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chunks_memory_id ON chunks(memory_id);
CREATE INDEX IF NOT EXISTS idx_connections_source ON connections(source_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON connections(target_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity(timestamp);
"""


def connect() -> sqlite3.Connection:
    settings = get_settings()
    conn = sqlite3.connect(settings.database_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)


def get_db() -> Iterator[sqlite3.Connection]:
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()
