'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function ContextPanel({ isOpen, onClose, title, children }: ContextPanelProps) {
  return (
    <aside
      className={cn(
        'fixed right-0 top-14 z-20 h-[calc(100vh-3.5rem)] w-80 border-l border-border bg-background transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="h-full overflow-y-auto p-4">{children}</div>
    </aside>
  );
}

// Simple context panel content for related memories
export function RelatedMemoriesPanel({ memories }: { memories: { id: string; title: string; type: string }[] }) {
  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No related memories found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Related Memories
      </p>
      <div className="space-y-1">
        {memories.map((memory) => (
          <a
            key={memory.id}
            href={`/memories/${memory.id}`}
            className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary"
          >
            <p className="font-medium text-foreground">{memory.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{memory.type}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
