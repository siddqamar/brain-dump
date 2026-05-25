import hashlib
import json
import math
import re
from collections import Counter

import google.generativeai as genai

from .settings import get_settings

TOKEN_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_+-]{1,}")


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_RE.findall(text)]


def _embed_local(text: str) -> list[float]:
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


def _embed_gemini(text: str) -> list[float] | None:
    settings = get_settings()
    if not settings.gemini_api_key:
        return None
    try:
        genai.configure(api_key=settings.gemini_api_key)
        response = genai.embed_content(
            model=f"models/{settings.gemini_embedding_model}",
            content=text[:8000],
            task_type="retrieval_document",
        )
        values = response.get("embedding", {}).get("values", [])
        if values:
            return [float(value) for value in values]
    except Exception:
        return None
    return None


def _embed_gemini_query(text: str) -> list[float] | None:
    settings = get_settings()
    if not settings.gemini_api_key:
        return None
    try:
        genai.configure(api_key=settings.gemini_api_key)
        response = genai.embed_content(
            model=f"models/{settings.gemini_embedding_model}",
            content=text[:8000],
            task_type="retrieval_query",
        )
        values = response.get("embedding", {}).get("values", [])
        if values:
            return [float(value) for value in values]
    except Exception:
        return None
    return None


def embed_text(text: str) -> list[float]:
    settings = get_settings()
    if settings.embedding_provider.lower() == "gemini":
        vector = _embed_gemini(text)
        if vector:
            return vector
    return _embed_local(text)


def embed_query(text: str) -> list[float]:
    settings = get_settings()
    if settings.embedding_provider.lower() == "gemini":
        vector = _embed_gemini_query(text)
        if vector:
            return vector
    return _embed_local(text)


def cosine(left: list[float], right: list[float]) -> float:
    if len(left) != len(right):
        return 0.0
    return sum(a * b for a, b in zip(left, right))


def dumps(vector: list[float]) -> str:
    return json.dumps(vector, separators=(",", ":"))


def loads(raw: str) -> list[float]:
    return json.loads(raw)
