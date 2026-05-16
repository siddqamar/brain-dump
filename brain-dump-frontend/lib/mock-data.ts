// Mock data for Brain Dump - structured for easy backend integration

export type MemoryType = 'screenshot' | 'pdf' | 'link' | 'text' | 'youtube';
export type MemoryStatus = 'processing' | 'indexed' | 'failed';

export interface Memory {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  summary: string;
  source?: string;
  sourceUrl?: string;
  thumbnail?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: MemoryStatus;
  embedding?: number[];
  connections: string[];
  relevanceScore?: number;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number; // 0-1
  relationshipType: 'similar' | 'references' | 'contradicts' | 'extends' | 'related';
  description: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  memoryIds: string[];
  type: 'pattern' | 'gap' | 'trend' | 'cluster' | 'suggestion';
  confidence: number;
  createdAt: string;
  actionable: boolean;
}

export interface SystemStatus {
  localAIActive: boolean;
  processingQueue: number;
  totalMemories: number;
  totalConnections: number;
  lastSync: string;
  storageUsed: number;
  storageTotal: number;
}

// Mock Memories
export const mockMemories: Memory[] = [
  {
    id: 'mem-001',
    type: 'link',
    title: 'Understanding React Server Components',
    content: 'React Server Components represent a new paradigm in React development, allowing components to render on the server with zero JavaScript sent to the client...',
    summary: 'Deep dive into RSC architecture, benefits for performance, and migration strategies from traditional React apps.',
    source: 'React Blog',
    sourceUrl: 'https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023',
    tags: ['react', 'server-components', 'performance', 'next.js'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    status: 'indexed',
    connections: ['mem-002', 'mem-005', 'mem-008'],
    relevanceScore: 0.92,
  },
  {
    id: 'mem-002',
    type: 'youtube',
    title: 'Next.js 15 - Complete Overview',
    content: 'Comprehensive walkthrough of Next.js 15 features including Turbopack improvements, partial prerendering, and the new caching semantics...',
    summary: 'Video tutorial covering all major Next.js 15 updates with practical examples.',
    source: 'YouTube',
    sourceUrl: 'https://youtube.com/watch?v=example',
    thumbnail: '/api/placeholder/320/180',
    tags: ['next.js', 'tutorial', 'web-development', 'framework'],
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
    status: 'indexed',
    connections: ['mem-001', 'mem-003'],
    relevanceScore: 0.88,
  },
  {
    id: 'mem-003',
    type: 'pdf',
    title: 'System Design Interview Guide',
    content: 'Comprehensive guide covering distributed systems, scalability patterns, database design, caching strategies, and real-world case studies...',
    summary: 'PDF document with 150+ pages of system design concepts and interview preparation material.',
    source: 'Local File',
    tags: ['system-design', 'interview', 'architecture', 'scalability'],
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-12T09:00:00Z',
    status: 'indexed',
    connections: ['mem-006', 'mem-007'],
    relevanceScore: 0.85,
  },
  {
    id: 'mem-004',
    type: 'screenshot',
    title: 'UI Design Patterns - Dashboard Layout',
    content: 'Screenshot of modern dashboard design featuring sidebar navigation, data visualization cards, and responsive grid layout...',
    summary: 'Reference design for admin dashboard with clean typography and intuitive navigation.',
    tags: ['ui-design', 'dashboard', 'inspiration', 'layout'],
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
    status: 'indexed',
    connections: ['mem-009'],
    relevanceScore: 0.78,
  },
  {
    id: 'mem-005',
    type: 'text',
    title: 'Notes on State Management',
    content: 'Key insights from researching state management solutions: Zustand for simplicity, Jotai for atomic state, Redux Toolkit for complex apps with time-travel debugging needs...',
    summary: 'Personal notes comparing different React state management approaches.',
    tags: ['react', 'state-management', 'notes', 'comparison'],
    createdAt: '2024-01-08T11:30:00Z',
    updatedAt: '2024-01-09T08:15:00Z',
    status: 'indexed',
    connections: ['mem-001', 'mem-002'],
    relevanceScore: 0.82,
  },
  {
    id: 'mem-006',
    type: 'link',
    title: 'PostgreSQL Performance Tuning',
    content: 'In-depth article on PostgreSQL query optimization, index strategies, EXPLAIN ANALYZE usage, and configuration tuning for high-traffic applications...',
    summary: 'Practical guide to improving PostgreSQL performance with real metrics and benchmarks.',
    source: 'PGAnalyze Blog',
    sourceUrl: 'https://pganalyze.com/blog/performance-tuning',
    tags: ['postgresql', 'database', 'performance', 'optimization'],
    createdAt: '2024-01-06T16:45:00Z',
    updatedAt: '2024-01-06T16:45:00Z',
    status: 'indexed',
    connections: ['mem-003', 'mem-007'],
    relevanceScore: 0.90,
  },
  {
    id: 'mem-007',
    type: 'text',
    title: 'Microservices Communication Patterns',
    content: 'Summary of communication patterns: Synchronous (REST, gRPC), Asynchronous (Message queues, Event streaming), Hybrid approaches for different use cases...',
    summary: 'Notes on choosing the right communication pattern for microservices architecture.',
    tags: ['microservices', 'architecture', 'patterns', 'distributed-systems'],
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
    status: 'indexed',
    connections: ['mem-003', 'mem-006'],
    relevanceScore: 0.87,
  },
  {
    id: 'mem-008',
    type: 'link',
    title: 'TypeScript 5.4 Release Notes',
    content: 'Overview of TypeScript 5.4 features including NoInfer utility type, improved type narrowing, and better support for conditional types...',
    summary: 'Official release notes with examples of new TypeScript features.',
    source: 'TypeScript Blog',
    sourceUrl: 'https://devblogs.microsoft.com/typescript/',
    tags: ['typescript', 'programming', 'release-notes', 'javascript'],
    createdAt: '2024-01-04T13:15:00Z',
    updatedAt: '2024-01-04T13:15:00Z',
    status: 'indexed',
    connections: ['mem-001', 'mem-005'],
    relevanceScore: 0.84,
  },
  {
    id: 'mem-009',
    type: 'screenshot',
    title: 'Color Palette - Ocean Theme',
    content: 'Screenshot of color palette featuring deep blues, teals, and warm accent colors for a modern application design...',
    summary: 'Design reference for ocean-inspired color scheme with accessibility considerations.',
    tags: ['design', 'colors', 'palette', 'accessibility'],
    createdAt: '2024-01-03T09:30:00Z',
    updatedAt: '2024-01-03T09:30:00Z',
    status: 'indexed',
    connections: ['mem-004'],
    relevanceScore: 0.75,
  },
  {
    id: 'mem-010',
    type: 'youtube',
    title: 'Building AI-Powered Applications',
    content: 'Tutorial on integrating LLMs into web applications, covering prompt engineering, streaming responses, and cost optimization strategies...',
    summary: 'Practical guide to building production-ready AI features.',
    source: 'YouTube',
    sourceUrl: 'https://youtube.com/watch?v=ai-tutorial',
    thumbnail: '/api/placeholder/320/180',
    tags: ['ai', 'llm', 'web-development', 'tutorial'],
    createdAt: '2024-01-02T14:00:00Z',
    updatedAt: '2024-01-02T14:00:00Z',
    status: 'indexed',
    connections: ['mem-001', 'mem-008'],
    relevanceScore: 0.91,
  },
  {
    id: 'mem-011',
    type: 'pdf',
    title: 'API Design Best Practices',
    content: 'Comprehensive document on RESTful API design, versioning strategies, error handling, pagination, and documentation standards...',
    summary: 'Reference guide for designing consistent and developer-friendly APIs.',
    source: 'Local File',
    tags: ['api', 'rest', 'design', 'best-practices'],
    createdAt: '2024-01-01T11:00:00Z',
    updatedAt: '2024-01-01T11:00:00Z',
    status: 'indexed',
    connections: ['mem-003', 'mem-007'],
    relevanceScore: 0.86,
  },
  {
    id: 'mem-012',
    type: 'text',
    title: 'Meeting Notes - Q1 Planning',
    content: 'Key decisions from Q1 planning: Focus on performance optimization, migrate to edge functions, implement observability stack...',
    summary: 'Summary of quarterly planning meeting with action items and deadlines.',
    tags: ['meeting', 'planning', 'notes', 'q1-2024'],
    createdAt: '2023-12-28T15:30:00Z',
    updatedAt: '2023-12-28T15:30:00Z',
    status: 'indexed',
    connections: [],
    relevanceScore: 0.70,
  },
];

// Mock Connections
export const mockConnections: Connection[] = [
  {
    id: 'conn-001',
    sourceId: 'mem-001',
    targetId: 'mem-002',
    strength: 0.89,
    relationshipType: 'related',
    description: 'Both discuss modern React and Next.js patterns for building web applications.',
    createdAt: '2024-01-15T10:35:00Z',
  },
  {
    id: 'conn-002',
    sourceId: 'mem-001',
    targetId: 'mem-005',
    strength: 0.76,
    relationshipType: 'extends',
    description: 'State management notes extend React concepts discussed in RSC article.',
    createdAt: '2024-01-15T10:36:00Z',
  },
  {
    id: 'conn-003',
    sourceId: 'mem-003',
    targetId: 'mem-006',
    strength: 0.82,
    relationshipType: 'references',
    description: 'System design guide references database optimization concepts.',
    createdAt: '2024-01-12T09:05:00Z',
  },
  {
    id: 'conn-004',
    sourceId: 'mem-003',
    targetId: 'mem-007',
    strength: 0.91,
    relationshipType: 'similar',
    description: 'Both cover distributed systems architecture patterns.',
    createdAt: '2024-01-12T09:06:00Z',
  },
  {
    id: 'conn-005',
    sourceId: 'mem-006',
    targetId: 'mem-007',
    strength: 0.78,
    relationshipType: 'related',
    description: 'Database performance impacts microservices communication decisions.',
    createdAt: '2024-01-06T16:50:00Z',
  },
  {
    id: 'conn-006',
    sourceId: 'mem-004',
    targetId: 'mem-009',
    strength: 0.85,
    relationshipType: 'similar',
    description: 'Both are visual design references for UI development.',
    createdAt: '2024-01-10T14:25:00Z',
  },
  {
    id: 'conn-007',
    sourceId: 'mem-008',
    targetId: 'mem-001',
    strength: 0.72,
    relationshipType: 'extends',
    description: 'TypeScript features enhance React development experience.',
    createdAt: '2024-01-15T10:37:00Z',
  },
  {
    id: 'conn-008',
    sourceId: 'mem-010',
    targetId: 'mem-001',
    strength: 0.80,
    relationshipType: 'related',
    description: 'AI integration commonly implemented in modern React applications.',
    createdAt: '2024-01-15T10:38:00Z',
  },
  {
    id: 'conn-009',
    sourceId: 'mem-011',
    targetId: 'mem-003',
    strength: 0.88,
    relationshipType: 'references',
    description: 'API design is a crucial part of system design interviews.',
    createdAt: '2024-01-12T09:07:00Z',
  },
  {
    id: 'conn-010',
    sourceId: 'mem-002',
    targetId: 'mem-003',
    strength: 0.65,
    relationshipType: 'related',
    description: 'Framework knowledge useful for system design discussions.',
    createdAt: '2024-01-14T15:50:00Z',
  },
];

// Mock Insights
export const mockInsights: Insight[] = [
  {
    id: 'ins-001',
    title: 'Strong Web Development Focus',
    description: 'Your knowledge base shows a concentrated focus on React, Next.js, and modern web development patterns. Consider diversifying into mobile or backend technologies.',
    memoryIds: ['mem-001', 'mem-002', 'mem-005', 'mem-008'],
    type: 'cluster',
    confidence: 0.92,
    createdAt: '2024-01-15T12:00:00Z',
    actionable: true,
  },
  {
    id: 'ins-002',
    title: 'System Design Knowledge Gap',
    description: 'Limited content on caching strategies and CDN architecture. These are frequently asked in senior engineering interviews.',
    memoryIds: ['mem-003', 'mem-007'],
    type: 'gap',
    confidence: 0.78,
    createdAt: '2024-01-14T08:00:00Z',
    actionable: true,
  },
  {
    id: 'ins-003',
    title: 'Rising Interest in AI Integration',
    description: 'Recent captures show increasing interest in AI/LLM integration. Consider creating a dedicated learning path.',
    memoryIds: ['mem-010'],
    type: 'trend',
    confidence: 0.85,
    createdAt: '2024-01-13T16:00:00Z',
    actionable: true,
  },
  {
    id: 'ins-004',
    title: 'Design Resources Cluster',
    description: 'You have accumulated visual design references that could be organized into a design system resource collection.',
    memoryIds: ['mem-004', 'mem-009'],
    type: 'pattern',
    confidence: 0.88,
    createdAt: '2024-01-12T14:00:00Z',
    actionable: true,
  },
  {
    id: 'ins-005',
    title: 'Consider Reviewing Old Notes',
    description: 'Some memories from December have not been revisited. Spaced repetition suggests reviewing them for better retention.',
    memoryIds: ['mem-012'],
    type: 'suggestion',
    confidence: 0.72,
    createdAt: '2024-01-11T10:00:00Z',
    actionable: true,
  },
];

// Mock System Status
export const mockSystemStatus: SystemStatus = {
  localAIActive: true,
  processingQueue: 3,
  totalMemories: 127,
  totalConnections: 89,
  lastSync: '2024-01-15T14:30:00Z',
  storageUsed: 2.4, // GB
  storageTotal: 10, // GB
};

// Mock Search Results (for search functionality)
export interface SearchResult extends Memory {
  matchScore: number;
  matchedSegments: string[];
}

export const mockSearchResults: SearchResult[] = mockMemories.slice(0, 5).map((mem, idx) => ({
  ...mem,
  matchScore: 0.95 - idx * 0.08,
  matchedSegments: ['React', 'Server Components', 'performance'],
}));

// Mock Tags with counts
export const mockTags: { name: string; count: number }[] = [
  { name: 'react', count: 15 },
  { name: 'next.js', count: 12 },
  { name: 'typescript', count: 10 },
  { name: 'system-design', count: 8 },
  { name: 'architecture', count: 7 },
  { name: 'performance', count: 6 },
  { name: 'database', count: 5 },
  { name: 'tutorial', count: 5 },
  { name: 'ai', count: 4 },
  { name: 'design', count: 4 },
];

// Mock Recent Activity
export interface Activity {
  id: string;
  type: 'capture' | 'connection' | 'insight' | 'search';
  description: string;
  memoryId?: string;
  timestamp: string;
}

export const mockRecentActivity: Activity[] = [
  {
    id: 'act-001',
    type: 'capture',
    description: 'Added "Understanding React Server Components"',
    memoryId: 'mem-001',
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    id: 'act-002',
    type: 'connection',
    description: 'Discovered 3 new connections',
    timestamp: '2024-01-15T10:35:00Z',
  },
  {
    id: 'act-003',
    type: 'insight',
    description: 'New insight: Strong Web Development Focus',
    timestamp: '2024-01-15T12:00:00Z',
  },
  {
    id: 'act-004',
    type: 'capture',
    description: 'Added "Next.js 15 - Complete Overview"',
    memoryId: 'mem-002',
    timestamp: '2024-01-14T15:45:00Z',
  },
  {
    id: 'act-005',
    type: 'search',
    description: 'Searched for "state management patterns"',
    timestamp: '2024-01-14T14:20:00Z',
  },
];

// Helper functions for mock API simulation
export const getMemoryById = (id: string): Memory | undefined => {
  return mockMemories.find((m) => m.id === id);
};

export const getConnectionsForMemory = (memoryId: string): Connection[] => {
  return mockConnections.filter(
    (c) => c.sourceId === memoryId || c.targetId === memoryId
  );
};

export const getRelatedMemories = (memoryId: string): Memory[] => {
  const memory = getMemoryById(memoryId);
  if (!memory) return [];
  return memory.connections
    .map((id) => getMemoryById(id))
    .filter((m): m is Memory => m !== undefined);
};

export const searchMemories = (query: string): SearchResult[] => {
  const lowerQuery = query.toLowerCase();
  return mockMemories
    .filter(
      (m) =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.content.toLowerCase().includes(lowerQuery) ||
        m.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    )
    .map((m) => ({
      ...m,
      matchScore: Math.random() * 0.3 + 0.7,
      matchedSegments: [query],
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
};
