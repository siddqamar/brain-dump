'use client';

import { useEffect, useState } from 'react';
import { Grid, List, Filter, SortAsc } from 'lucide-react';
import { MemoryCard } from '@/components/memory';
import { fetchMemories, fetchTags } from '@/lib/api';
import type { Memory, MemoryType } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'relevance' | 'connections';

const memoryTypes: { value: MemoryType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'link', label: 'Links' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'screenshot', label: 'Screenshots' },
  { value: 'text', label: 'Notes' },
  { value: 'youtube', label: 'Videos' },
];

export function MemoriesContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedType, setSelectedType] = useState<MemoryType | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    fetchMemories().then(setMemories);
    fetchTags().then(setTags);
  }, []);

  const filteredMemories = memories.filter((memory) => {
    if (selectedType !== 'all' && memory.type !== selectedType) return false;
    if (selectedTags.length > 0 && !selectedTags.some((tag) => memory.tags.includes(tag))) {
      return false;
    }
    return true;
  });

  const sortedMemories = [...filteredMemories].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'relevance') {
      return (b.relevanceScore || 0) - (a.relevanceScore || 0);
    }
    if (sortBy === 'connections') {
      return b.connections.length - a.connections.length;
    }
    return 0;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Memory Feed</h1>
          <p className="mt-1 text-muted-foreground">
            {filteredMemories.length} memories in your knowledge base
          </p>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-secondary/50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="date">Sort by Date</option>
            <option value="relevance">Sort by Relevance</option>
            <option value="connections">Sort by Connections</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 space-y-4">
        {/* Type Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {memoryTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={cn(
                'rounded-full px-3 py-1 text-sm transition-colors',
                selectedType === type.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 10).map((tag) => (
            <button
              key={tag.name}
              onClick={() => toggleTag(tag.name)}
              className={cn(
                'rounded-full px-2.5 py-1 text-sm transition-colors',
                selectedTags.includes(tag.name)
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              )}
            >
              #{tag.name}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Memory Grid/List */}
      <div className="mt-6">
        {sortedMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <p className="text-muted-foreground">No memories match your filters</p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedTags([]);
              }}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} variant="featured" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
