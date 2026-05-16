'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Layers,
  Target,
  Sparkles,
  Calendar,
  Percent,
} from 'lucide-react';
import { mockInsights, getMemoryById, type Insight } from '@/lib/mock-data';
import { MemoryCard } from '@/components/memory';
import { cn } from '@/lib/utils';

interface InsightDetailContentProps {
  insightId: string;
}

const insightIcons: Record<Insight['type'], typeof Lightbulb> = {
  pattern: Layers,
  gap: AlertTriangle,
  trend: TrendingUp,
  cluster: Target,
  suggestion: Sparkles,
};

const insightColors: Record<Insight['type'], { bg: string; text: string; border: string }> = {
  pattern: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  gap: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  trend: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  cluster: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  suggestion: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function InsightDetailContent({ insightId }: InsightDetailContentProps) {
  const insight = mockInsights.find((i) => i.id === insightId);

  if (!insight) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Insight not found</p>
      </div>
    );
  }

  const relatedMemories = insight.memoryIds
    .map((id) => getMemoryById(id))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  const Icon = insightIcons[insight.type];
  const colors = insightColors[insight.type];

  return (
    <div className="p-6">
      {/* Back Navigation */}
      <Link
        href="/insights"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Insights
      </Link>

      {/* Header */}
      <div className="mt-6">
        <div className="flex items-center gap-3">
          <div className={cn('rounded-lg p-3', colors.bg)}>
            <Icon className={cn('h-6 w-6', colors.text)} />
          </div>
          <div>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', colors.bg, colors.text)}>
              {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
            </span>
            {insight.actionable && (
              <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Actionable
              </span>
            )}
          </div>
        </div>

        <h1 className="mt-4 text-3xl font-semibold text-foreground">{insight.title}</h1>

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(insight.createdAt)}
          </div>
          <div className="flex items-center gap-1.5">
            <Percent className="h-4 w-4" />
            {Math.round(insight.confidence * 100)}% confidence
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className={cn('rounded-xl border p-6', colors.border, `${colors.bg}`)}>
            <h2 className="text-lg font-medium text-foreground">Analysis</h2>
            <p className="mt-3 leading-relaxed text-foreground">{insight.description}</p>
          </div>

          {/* Related Memories */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-medium text-foreground">
              Related Memories ({relatedMemories.length})
            </h2>
            <div className="mt-4 space-y-3">
              {relatedMemories.length > 0 ? (
                relatedMemories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))
              ) : (
                <p className="text-muted-foreground">No related memories found</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Confidence Breakdown */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-medium text-foreground">Confidence Score</h3>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall</span>
                <span className="font-medium text-foreground">
                  {Math.round(insight.confidence * 100)}%
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn('h-full', colors.bg.replace('/10', ''))}
                  style={{ width: `${insight.confidence * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Coverage</span>
                <span className="text-foreground">High</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pattern Strength</span>
                <span className="text-foreground">Strong</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Relevance</span>
                <span className="text-foreground">Recent</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-medium text-foreground">Actions</h3>
            <div className="mt-4 space-y-2">
              <button className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Mark as Addressed
              </button>
              <button className="w-full rounded-lg bg-secondary py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80">
                Dismiss Insight
              </button>
              <button className="w-full rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                Add to Learning Path
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
