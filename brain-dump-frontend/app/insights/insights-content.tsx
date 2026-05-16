'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Layers,
  Target,
  Sparkles,
  ArrowRight,
  Filter,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { fetchInsights, fetchMemories, refreshInsights } from '@/lib/api';
import type { Insight, Memory } from '@/lib/mock-data';
import { MemoryCard } from '@/components/memory';
import { cn } from '@/lib/utils';

type InsightFilter = 'all' | Insight['type'];

const insightTypes: { value: InsightFilter; label: string; icon: typeof Lightbulb; color: string }[] = [
  { value: 'all', label: 'All Insights', icon: Lightbulb, color: 'text-foreground' },
  { value: 'pattern', label: 'Patterns', icon: Layers, color: 'text-purple-400' },
  { value: 'gap', label: 'Knowledge Gaps', icon: AlertTriangle, color: 'text-orange-400' },
  { value: 'trend', label: 'Trends', icon: TrendingUp, color: 'text-blue-400' },
  { value: 'cluster', label: 'Clusters', icon: Target, color: 'text-emerald-400' },
  { value: 'suggestion', label: 'Suggestions', icon: Sparkles, color: 'text-yellow-400' },
];

function InsightCard({ insight, memories, expanded = false }: { insight: Insight; memories: Memory[]; expanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const relatedMemories = insight.memoryIds
    .map((id) => memories.find((memory) => memory.id === id))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  const typeConfig = insightTypes.find((t) => t.value === insight.type) || insightTypes[0];
  const Icon = typeConfig.icon;

  const typeColors: Record<Insight['type'], string> = {
    pattern: 'border-purple-500/30 bg-purple-500/5',
    gap: 'border-orange-500/30 bg-orange-500/5',
    trend: 'border-blue-500/30 bg-blue-500/5',
    cluster: 'border-emerald-500/30 bg-emerald-500/5',
    suggestion: 'border-yellow-500/30 bg-yellow-500/5',
  };

  const badgeColors: Record<Insight['type'], string> = {
    pattern: 'bg-purple-500/10 text-purple-400',
    gap: 'bg-orange-500/10 text-orange-400',
    trend: 'bg-blue-500/10 text-blue-400',
    cluster: 'bg-emerald-500/10 text-emerald-400',
    suggestion: 'bg-yellow-500/10 text-yellow-400',
  };

  return (
    <div className={cn('rounded-xl border transition-all', typeColors[insight.type])}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-card p-2">
              <Icon className={cn('h-5 w-5', typeConfig.color)} />
            </div>
            <div>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', badgeColors[insight.type])}>
                {typeConfig.label.slice(0, -1)}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {Math.round(insight.confidence * 100)}% confidence
              </span>
            </div>
          </div>
          {insight.actionable && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Actionable
            </span>
          )}
        </div>

        <h3 className="mt-4 text-lg font-semibold text-foreground">{insight.title}</h3>
        <p className="mt-2 text-muted-foreground">{insight.description}</p>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {isExpanded ? 'Hide' : 'Show'} related memories ({relatedMemories.length})
          <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
        </button>
      </div>

      {isExpanded && relatedMemories.length > 0 && (
        <div className="border-t border-border bg-card/50 p-5">
          <div className="space-y-3">
            {relatedMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} variant="compact" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function InsightsContent() {
  const [filter, setFilter] = useState<InsightFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    fetchInsights().then(setInsights);
    fetchMemories().then(setMemories);
  }, []);

  const filteredInsights = insights.filter(
    (insight) => filter === 'all' || insight.type === filter
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setInsights(await refreshInsights());
    } finally {
      setIsRefreshing(false);
    }
  };

  // Stats
  const stats = insightTypes.slice(1).map((type) => ({
    ...type,
    count: insights.filter((i) => i.type === type.value).length,
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Insights</h1>
          <p className="mt-1 text-muted-foreground">
            AI-discovered patterns and suggestions from your knowledge base
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          {isRefreshing ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.value}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <div>
              <p className="text-2xl font-semibold text-foreground">{stat.count}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {insightTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
              filter === type.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            <type.icon className="h-3.5 w-3.5" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="mt-6 space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <Lightbulb className="h-8 w-8 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">No insights yet</p>
            <p className="mt-1 text-muted-foreground">
              Add more memories to discover patterns and connections
            </p>
          </div>
        ) : (
          filteredInsights.map((insight, idx) => (
            <InsightCard key={insight.id} insight={insight} memories={memories} expanded={idx === 0} />
          ))
        )}
      </div>

      {/* How it works */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h3 className="font-medium text-foreground">How Insights Work</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Our local AI analyzes your memories to find patterns, identify knowledge gaps,
          and surface forgotten ideas. Insights are generated using semantic analysis of
          your content and its connections.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <Layers className="h-5 w-5 text-purple-400" />
            <p className="mt-2 text-sm font-medium text-foreground">Patterns</p>
            <p className="text-xs text-muted-foreground">Recurring themes in your knowledge</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <p className="mt-2 text-sm font-medium text-foreground">Gaps</p>
            <p className="text-xs text-muted-foreground">Missing areas to explore</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <p className="mt-2 text-sm font-medium text-foreground">Trends</p>
            <p className="text-xs text-muted-foreground">Evolution of your interests</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <Target className="h-5 w-5 text-emerald-400" />
            <p className="mt-2 text-sm font-medium text-foreground">Clusters</p>
            <p className="text-xs text-muted-foreground">Groups of related memories</p>
          </div>
        </div>
      </div>
    </div>
  );
}
