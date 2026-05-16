import hashlib
import json
import math
import re
from collections import Counter

from .settings import get_settings

TOKEN_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_+-]{1,}")


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_RE.findall(text)]


def embed_text(text: str) -> list[float]:
    """Deterministic local embedding for the MVP.

    This is intentionally dependency-light. It gives useful semantic-ish matching through
    normalized hashed token vectors, and can later be swapped for pgvector plus a local
    sentence-transformer/llama.cpp embedding endpoint without changing API contracts.
    """
    dims = get_settings().embedding_dimensions
    vector = [0.0] * dims
    counts = Counter(tokenize(text))

    for token, count in counts.items():
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % dims
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        vector[index] += sign * (1.0 + math.log(count))

    length = math.sqrt(sum(value * value for value in vector))
    if length == 0:
        return vector
    return [value / length for value in vector]


def cosine(left: list[float], right: list[float]) -> float:
    return sum(a * b for a, b in zip(left, right))


def dumps(vector: list[float]) -> str:
    return json.dumps(vector, separators=(",", ":"))


def loads(raw: str) -> list[float]:
    return json.loads(raw)
