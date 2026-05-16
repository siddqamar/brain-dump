from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


MemoryType = Literal["screenshot", "pdf", "link", "text", "youtube"]
MemoryStatus = Literal["processing", "indexed", "failed"]
RelationshipType = Literal["similar", "references", "contradicts", "extends", "related"]


class Memory(BaseModel):
    id: str
    type: MemoryType
    title: str
    content: str
    summary: str
    source: str | None = None
    sourceUrl: str | None = None
    thumbnail: str | None = None
    tags: list[str] = Field(default_factory=list)
    createdAt: str
    updatedAt: str
    status: MemoryStatus
    connections: list[str] = Field(default_factory=list)
    relevanceScore: float | None = None


class SearchResult(Memory):
    matchScore: float
    matchedSegments: list[str] = Field(default_factory=list)


class Connection(BaseModel):
    id: str
    sourceId: str
    targetId: str
    strength: float
    relationshipType: RelationshipType
    description: str
    createdAt: str


class Insight(BaseModel):
    id: str
    title: str
    description: str
    memoryIds: list[str]
    type: Literal["pattern", "gap", "trend", "cluster", "suggestion"]
    confidence: float
    createdAt: str
    actionable: bool = True


class SystemStatus(BaseModel):
    localAIActive: bool
    processingQueue: int
    totalMemories: int
    totalConnections: int
    lastSync: str
    storageUsed: float
    storageTotal: float


class Activity(BaseModel):
    id: str
    type: Literal["capture", "connection", "insight", "search"]
    description: str
    memoryId: str | None = None
    timestamp: str


class TextCaptureRequest(BaseModel):
    title: str | None = None
    content: str = Field(min_length=1)
    tags: list[str] = Field(default_factory=list)


class UrlCaptureRequest(BaseModel):
    url: HttpUrl
    tags: list[str] = Field(default_factory=list)
    type: Literal["link", "youtube"] = "link"
