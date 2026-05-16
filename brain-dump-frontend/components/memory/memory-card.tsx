import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MemoryTypeIcon } from './memory-type-icon';
import type { Memory } from '@/lib/mock-data';
import { ExternalLink, Clock, ArrowRight } from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
  variant?: 'default' | 'compact' | 'featured';
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function MemoryCard({ memory, variant = 'default' }: MemoryCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/memories/${memory.id}`}
        className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:bg-card/80"
      >
        <MemoryTypeIcon type={memory.type} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
            {memory.title}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(memory.createdAt)}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/memories/${memory.id}`}
        className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
      >
        <div className="flex items-start justify-between">
          <MemoryTypeIcon type={memory.type} showLabel />
          {memory.sourceUrl && (
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary">
          {memory.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {memory.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {memory.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {memory.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{memory.tags.length - 3}</span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDate(memory.createdAt)}
          </div>
          {memory.connections.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {memory.connections.length} connections
            </span>
          )}
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/memories/${memory.id}`}
      className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
        <MemoryTypeIcon type={memory.type} size="lg" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground group-hover:text-primary">
            {memory.title}
          </h3>
          {memory.source && (
            <span className="flex-shrink-0 text-xs text-muted-foreground">
              {memory.source}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {memory.summary}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex flex-wrap gap-1">
            {memory.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(memory.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
