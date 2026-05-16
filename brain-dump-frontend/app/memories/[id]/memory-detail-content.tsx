'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Tag,
  Network,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  Share2,
} from 'lucide-react';
import { MemoryTypeBadge } from '@/components/memory';
import { MemoryCard } from '@/components/memory';
import { fetchMemoryDetail } from '@/lib/api';
import type { Connection, Memory } from '@/lib/mock-data';

interface MemoryDetailContentProps {
  memoryId: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MemoryDetailContent({ memoryId }: MemoryDetailContentProps) {
  const [memory, setMemory] = useState<Memory | null>(null);
  const [relatedMemories, setRelatedMemories] = useState<Memory[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchMemoryDetail(memoryId).then((detail) => {
      setMemory(detail.memory);
      setRelatedMemories(detail.relatedMemories);
      setConnections(detail.connections);
    });
  }, [memoryId]);

  if (!memory) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Memory not found</p>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Back Navigation */}
        <Link
          href="/memories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Memories
        </Link>

        {/* Header */}
        <div className="mt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <MemoryTypeBadge type={memory.type} />
              {memory.source && (
                <span className="text-sm text-muted-foreground">{memory.source}</span>
              )}
            </div>
            
            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-10 z-10 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-lg">
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <div className="my-1 h-px bg-border" />
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-semibold text-foreground">{memory.title}</h1>

          {/* Meta info */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(memory.createdAt)}
            </div>
            {memory.sourceUrl && (
              <a
                href={memory.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View Source
              </a>
            )}
            <div className="flex items-center gap-1.5">
              <Network className="h-4 w-4" />
              {memory.connections.length} connections
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {memory.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?tag=${tag}`}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm transition-colors hover:bg-secondary/80"
              >
                <Tag className="h-3 w-3 text-muted-foreground" />
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-medium text-foreground">Summary</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{memory.summary}</p>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-medium text-foreground">Full Content</h2>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground">
              {memory.content}
            </p>
          </div>
        </div>

        {/* Connections Details */}
        {connections.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-foreground">Connections</h2>
            <div className="mt-4 space-y-3">
              {connections.map((conn) => {
                const relatedId = conn.sourceId === memoryId ? conn.targetId : conn.sourceId;
                const relatedMem = relatedMemories.find((item) => item.id === relatedId);
                if (!relatedMem) return null;

                const relationColors = {
                  similar: 'bg-emerald-500/10 text-emerald-400',
                  references: 'bg-blue-500/10 text-blue-400',
                  contradicts: 'bg-red-500/10 text-red-400',
                  extends: 'bg-purple-500/10 text-purple-400',
                  related: 'bg-orange-500/10 text-orange-400',
                };

                return (
                  <Link
                    key={conn.id}
                    href={`/memories/${relatedId}`}
                    className="block rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${relationColors[conn.relationshipType]}`}
                          >
                            {conn.relationshipType}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(conn.strength * 100)}% match
                          </span>
                        </div>
                        <p className="mt-2 font-medium text-foreground">{relatedMem.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{conn.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Related Memories */}
      <aside className="hidden w-80 border-l border-border p-6 lg:block">
        <h3 className="font-medium text-foreground">Related Memories</h3>
        <div className="mt-4 space-y-3">
          {relatedMemories.length > 0 ? (
            relatedMemories.map((related) => (
              <MemoryCard key={related.id} memory={related} variant="compact" />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No related memories found</p>
          )}
        </div>

        {/* Relevance Score */}
        {memory.relevanceScore && (
          <div className="mt-8">
            <h3 className="font-medium text-foreground">Relevance Score</h3>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall</span>
                <span className="font-medium text-foreground">
                  {Math.round(memory.relevanceScore * 100)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${memory.relevanceScore * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
