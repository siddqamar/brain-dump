'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Upload,
  Cpu,
  Loader2,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchStatus } from '@/lib/api';
import type { SystemStatus } from '@/lib/mock-data';

export function TopBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState<SystemStatus>({
    localAIActive: false,
    processingQueue: 0,
    totalMemories: 0,
    totalConnections: 0,
    lastSync: new Date().toISOString(),
    storageUsed: 0,
    storageTotal: 10,
  });

  useEffect(() => {
    fetchStatus().then(setStatus);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed left-60 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border bg-secondary/50 px-3 py-1.5 transition-all',
            isFocused ? 'border-primary ring-1 ring-primary/20' : 'border-transparent'
          )}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Semantic search across your memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </form>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Processing status */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                status.localAIActive ? 'bg-emerald-500' : 'bg-muted-foreground'
              )}
            />
            <span className="text-muted-foreground">Local AI</span>
          </div>
          {status.processingQueue > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>{status.processingQueue} processing</span>
            </div>
          )}
        </div>

        {/* Upload button */}
        <button
          onClick={() => router.push('/upload')}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Capture</span>
        </button>

        {/* Local mode indicator */}
        <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs">
          <Cpu className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">Local</span>
        </div>
      </div>
    </header>
  );
}
