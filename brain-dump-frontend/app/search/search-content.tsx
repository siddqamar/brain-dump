'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  Clock,
  TrendingUp,
  X,
  Filter,
} from 'lucide-react';
import { MemoryCard } from '@/components/memory';
import type { SearchResult } from '@/lib/mock-data';
import { fetchMemories, fetchTags, searchMemoriesApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const recentSearches = [
  'React Server Components',
  'system design patterns',
  'TypeScript generics',
  'database optimization',
];

const suggestedSearches = [
  'performance optimization',
  'microservices architecture',
  'state management',
  'API design best practices',
];

export function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialTag = searchParams.get('tag') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchTags().then(setTags);
    if (initialQuery || initialTag) {
      performSearch(initialQuery, initialTag);
    }
  }, [initialQuery, initialTag]);

  const performSearch = async (searchQuery: string, tag?: string) => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchResults = searchQuery
        ? await searchMemoriesApi(searchQuery, tag)
        : (await fetchMemories())
            .filter((memory) => !tag || memory.tags.includes(tag))
            .map((memory) => ({ ...memory, matchScore: 0.5, matchedSegments: [] }));
      setResults(searchResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    router.push(`/search?tag=${encodeURIComponent(tag)}`);
    performSearch(query, tag);
  };

  const clearTag = () => {
    setSelectedTag('');
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      performSearch(query);
    } else {
      router.push('/search');
      setHasSearched(false);
      setResults([]);
    }
  };

  const handleSuggestedSearch = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    performSearch(suggestion);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Semantic Search</h1>
          <p className="mt-1 text-muted-foreground">
            Find memories using natural language queries
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your memories semantically..."
              className="w-full rounded-xl border border-border bg-card py-4 pl-12 pr-12 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* AI indicator */}
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Powered by local AI embeddings</span>
          </div>
        </form>

        {/* Active Tag Filter */}
        {selectedTag && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-sm text-primary">
              #{selectedTag}
              <button onClick={clearTag} className="ml-1 hover:text-primary/80">
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-8">
        {!hasSearched ? (
          /* Pre-search state */
          <div className="mx-auto max-w-3xl">
            {/* Recent Searches */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Recent Searches</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSuggestedSearch(search)}
                    className="rounded-full bg-secondary px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Searches */}
            <div className="mt-4 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Suggested Searches</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestedSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSuggestedSearch(search)}
                    className="rounded-full bg-secondary px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="mt-4 rounded-xl border border-border bg-card p-6">
              <h3 className="font-medium text-foreground">Browse by Tag</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm transition-colors hover:bg-primary/20 hover:text-primary"
                  >
                    <span className="text-foreground">#{tag.name}</span>
                    <span className="text-xs text-muted-foreground">{tag.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isSearching ? (
          /* Loading state */
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground">Searching through your memories...</p>
          </div>
        ) : results.length === 0 ? (
          /* No results */
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-foreground">No memories found</p>
              <p className="mt-1 text-muted-foreground">
                Try adjusting your search query or filters
              </p>
            </div>
          </div>
        ) : (
          /* Results */
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {results.length} memories
                {query && <span> for &ldquo;{query}&rdquo;</span>}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {results.map((result) => (
                <div key={result.id} className="relative">
                  <MemoryCard memory={result} variant="featured" />
                  <div className="absolute right-4 top-4 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {Math.round(result.matchScore * 100)}% match
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
