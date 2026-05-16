import {
  mockConnections,
  mockInsights,
  mockMemories,
  mockRecentActivity,
  mockSystemStatus,
  mockTags,
  type Activity,
  type Connection,
  type Insight,
  type Memory,
  type SearchResult,
  type SystemStatus,
} from './mock-data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8765';

async function apiFetch<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: init?.body instanceof FormData
        ? init.headers
        : { 'Content-Type': 'application/json', ...init?.headers },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  } catch (error) {
    console.warn(`Using mock fallback for ${path}`, error);
    return fallback;
  }
}

export function getApiBase() {
  return API_BASE;
}

export function fetchStatus(): Promise<SystemStatus> {
  return apiFetch('/api/status', mockSystemStatus);
}

export function fetchMemories(): Promise<Memory[]> {
  return apiFetch('/api/memories', mockMemories);
}

export function fetchMemoryDetail(id: string): Promise<{
  memory: Memory | null;
  connections: Connection[];
  relatedMemories: Memory[];
}> {
  const memory = mockMemories.find((item) => item.id === id) || null;
  return apiFetch(`/api/memories/${id}`, {
    memory,
    connections: mockConnections.filter((item) => item.sourceId === id || item.targetId === id),
    relatedMemories: memory
      ? memory.connections
          .map((relatedId) => mockMemories.find((item) => item.id === relatedId))
          .filter((item): item is Memory => Boolean(item))
      : [],
  });
}

export function fetchConnections(): Promise<Connection[]> {
  return apiFetch('/api/connections', mockConnections);
}

export function fetchInsights(): Promise<Insight[]> {
  return apiFetch('/api/insights', mockInsights);
}

export function refreshInsights(): Promise<Insight[]> {
  return apiFetch('/api/insights/refresh', mockInsights, { method: 'POST' });
}

export function fetchTags(): Promise<{ name: string; count: number }[]> {
  return apiFetch('/api/tags', mockTags);
}

export function fetchActivity(): Promise<Activity[]> {
  return apiFetch('/api/activity', mockRecentActivity);
}

export function searchMemoriesApi(query: string, tag?: string): Promise<SearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (tag) params.set('tag', tag);
  return apiFetch(`/api/search?${params.toString()}`, [] as SearchResult[]);
}

export function captureText(payload: {
  title?: string;
  content: string;
  tags: string[];
}): Promise<Memory> {
  return apiFetch('/api/capture/text', mockMemories[0], {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function captureUrl(payload: {
  url: string;
  tags: string[];
  type: 'link' | 'youtube';
}): Promise<Memory> {
  return apiFetch('/api/capture/url', mockMemories[0], {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function captureFile(file: File, tags: string[]): Promise<Memory> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tags', tags.join(','));

  return apiFetch('/api/capture/file', mockMemories[0], {
    method: 'POST',
    body: formData,
  });
}
