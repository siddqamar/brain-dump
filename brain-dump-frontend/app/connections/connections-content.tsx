'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Network, Filter, ArrowRight, Circle } from 'lucide-react';
import { MemoryTypeIcon } from '@/components/memory';
import { fetchConnections, fetchMemories } from '@/lib/api';
import type { Connection, Memory } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type RelationshipFilter = 'all' | Connection['relationshipType'];

const relationshipTypes: { value: RelationshipFilter; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'bg-foreground' },
  { value: 'similar', label: 'Similar', color: 'bg-emerald-500' },
  { value: 'references', label: 'References', color: 'bg-blue-500' },
  { value: 'extends', label: 'Extends', color: 'bg-purple-500' },
  { value: 'related', label: 'Related', color: 'bg-orange-500' },
  { value: 'contradicts', label: 'Contradicts', color: 'bg-red-500' },
];

function ConnectionCard({ connection, memories }: { connection: Connection; memories: Memory[] }) {
  const source = memories.find((memory) => memory.id === connection.sourceId);
  const target = memories.find((memory) => memory.id === connection.targetId);

  if (!source || !target) return null;

  const relationColors: Record<Connection['relationshipType'], string> = {
    similar: 'border-emerald-500/30 bg-emerald-500/5',
    references: 'border-blue-500/30 bg-blue-500/5',
    extends: 'border-purple-500/30 bg-purple-500/5',
    related: 'border-orange-500/30 bg-orange-500/5',
    contradicts: 'border-red-500/30 bg-red-500/5',
  };

  const badgeColors: Record<Connection['relationshipType'], string> = {
    similar: 'bg-emerald-500/10 text-emerald-400',
    references: 'bg-blue-500/10 text-blue-400',
    extends: 'bg-purple-500/10 text-purple-400',
    related: 'bg-orange-500/10 text-orange-400',
    contradicts: 'bg-red-500/10 text-red-400',
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all hover:shadow-md',
        relationColors[connection.relationshipType]
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
            badgeColors[connection.relationshipType]
          )}
        >
          {connection.relationshipType}
        </span>
        <span className="text-xs text-muted-foreground">
          {Math.round(connection.strength * 100)}% strength
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        {/* Source Memory */}
        <Link
          href={`/memories/${source.id}`}
          className="group flex-1 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50"
        >
          <div className="flex items-center gap-2">
            <MemoryTypeIcon type={source.type} size="sm" />
            <span className="text-xs text-muted-foreground capitalize">{source.type}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
            {source.title}
          </p>
        </Link>

        {/* Connection Indicator */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-px w-8 bg-border" />
          <Network className="h-4 w-4 text-muted-foreground" />
          <div className="h-px w-8 bg-border" />
        </div>

        {/* Target Memory */}
        <Link
          href={`/memories/${target.id}`}
          className="group flex-1 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50"
        >
          <div className="flex items-center gap-2">
            <MemoryTypeIcon type={target.type} size="sm" />
            <span className="text-xs text-muted-foreground capitalize">{target.type}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
            {target.title}
          </p>
        </Link>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{connection.description}</p>
    </div>
  );
}

// Simple graph visualization
function ConnectionsGraph({ memories, connections }: { memories: Memory[]; connections: Connection[] }) {
  const nodes = useMemo(() => {
    const nodeMap = new Map<string, { id: string; title: string; connections: number; x: number; y: number }>();
    
    memories.forEach((mem, idx) => {
      const angle = (2 * Math.PI * idx) / Math.max(memories.length, 1);
      const radius = 150;
      nodeMap.set(mem.id, {
        id: mem.id,
        title: mem.title,
        connections: mem.connections.length,
        x: 200 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle),
      });
    });

    return nodeMap;
  }, [memories]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-medium text-foreground">Knowledge Graph</h3>
      <p className="mt-1 text-sm text-muted-foreground">Visual map of your memory connections</p>
      
      <div className="relative mt-4 h-[400px] overflow-hidden rounded-lg bg-secondary/30">
        <svg className="h-full w-full">
          {/* Draw connections */}
          {connections.map((conn) => {
            const source = nodes.get(conn.sourceId);
            const target = nodes.get(conn.targetId);
            if (!source || !target) return null;

            return (
              <line
                key={conn.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="currentColor"
                strokeOpacity={0.2}
                strokeWidth={Math.max(1, conn.strength * 3)}
                className="text-primary"
              />
            );
          })}

          {/* Draw nodes */}
          {Array.from(nodes.values()).map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={8 + node.connections * 2}
                className="fill-primary/20 stroke-primary"
                strokeWidth={2}
              />
              <title>{node.title}</title>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-lg bg-background/80 p-2 text-xs backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <Circle className="h-3 w-3 fill-primary/20 text-primary" />
            <span className="text-muted-foreground">Memory Node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-px w-4 bg-primary/40" />
            <span className="text-muted-foreground">Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConnectionsContent() {
  const [filter, setFilter] = useState<RelationshipFilter>('all');
  const [strengthMin, setStrengthMin] = useState(0);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    fetchConnections().then(setConnections);
    fetchMemories().then(setMemories);
  }, []);

  const filteredConnections = connections.filter((conn) => {
    if (filter !== 'all' && conn.relationshipType !== filter) return false;
    if (conn.strength < strengthMin / 100) return false;
    return true;
  });

  const stats = useMemo(() => {
    const counts = relationshipTypes.slice(1).map((type) => ({
      ...type,
      count: connections.filter((c) => c.relationshipType === type.value).length,
    }));
    return counts;
  }, [connections]);

  return (
    <div className="p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Connections</h1>
        <p className="mt-1 text-muted-foreground">
          Discover relationships between your memories
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 flex flex-wrap gap-3">
        {stats.map((stat) => (
          <div
            key={stat.value}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
          >
            <div className={cn('h-2 w-2 rounded-full', stat.color)} />
            <span className="text-sm text-foreground">{stat.label}</span>
            <span className="text-sm font-medium text-muted-foreground">{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Graph Visualization */}
      <div className="mt-6">
        <ConnectionsGraph memories={memories} connections={connections} />
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {relationshipTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors',
                filter === type.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {type.value !== 'all' && (
                <div className={cn('h-2 w-2 rounded-full', type.color)} />
              )}
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Min strength:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={strengthMin}
            onChange={(e) => setStrengthMin(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-foreground">{strengthMin}%</span>
        </div>
      </div>

      {/* Connections List */}
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-medium text-foreground">
          All Connections ({filteredConnections.length})
        </h2>
        
        {filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <Network className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No connections match your filters</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredConnections.map((connection) => (
              <ConnectionCard key={connection.id} connection={connection} memories={memories} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
