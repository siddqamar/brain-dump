'use client';

import { useEffect, useState } from 'react';
import {
  Brain,
  Network,
  Lightbulb,
  HardDrive,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { MemoryCard } from '@/components/memory';
import { fetchActivity, fetchInsights, fetchMemories, fetchStatus, fetchTags } from '@/lib/api';
import { mockInsights, type Activity, type Insight, type Memory, type SystemStatus } from '@/lib/mock-data';

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
}: {
  icon: typeof Brain;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-secondary p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-0.5 text-xs ${
              trend.positive ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            <TrendingUp className={`h-3 w-3 ${!trend.positive && 'rotate-180'}`} />
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const iconMap = {
    capture: Plus,
    connection: Network,
    insight: Lightbulb,
    search: Brain,
  };
  const Icon = iconMap[activity.type];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="rounded-md bg-secondary p-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{activity.description}</p>
        <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const typeColors = {
    pattern: 'bg-purple-500/10 text-purple-400',
    gap: 'bg-orange-500/10 text-orange-400',
    trend: 'bg-blue-500/10 text-blue-400',
    cluster: 'bg-emerald-500/10 text-emerald-400',
    suggestion: 'bg-yellow-500/10 text-yellow-400',
  };

  return (
    <Link
      href="/insights"
      className="group block rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-secondary p-2">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[insight.type]}`}>
              {insight.type}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(insight.confidence * 100)}% confidence
            </span>
          </div>
          <h4 className="mt-2 font-medium text-foreground group-hover:text-primary">
            {insight.title}
          </h4>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {insight.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function DashboardContent() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [insights, setInsights] = useState<Insight[]>(mockInsights);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [status, setStatus] = useState<SystemStatus>({
    localAIActive: false,
    processingQueue: 0,
    totalMemories: 0,
    totalConnections: 0,
    lastSync: new Date().toISOString(),
    storageUsed: 0,
    storageTotal: 10,
  });
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    fetchMemories().then(setMemories);
    fetchInsights().then(setInsights);
    fetchActivity().then(setActivity);
    fetchStatus().then(setStatus);
    fetchTags().then(setTags);
  }, []);

  const recentMemories = memories.slice(0, 3);
  const topInsights = insights.slice(0, 3);
  const storagePercent = (status.storageUsed / status.storageTotal) * 100;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your knowledge base and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Brain}
          label="Total Memories"
          value={status.totalMemories}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          icon={Network}
          label="Connections"
          value={status.totalConnections}
          subtext="Discovered relationships"
        />
        <StatCard
          icon={Lightbulb}
          label="Insights"
          value={insights.length}
          subtext="Actionable patterns"
        />
        <StatCard
          icon={HardDrive}
          label="Storage"
          value={`${status.storageUsed} GB`}
          subtext={`${storagePercent.toFixed(0)}% of ${status.storageTotal} GB used`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent Memories */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Recent Memories</h2>
            <Link
              href="/memories"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Capture */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Quick Capture</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Drop a link, paste text, or upload a file
            </p>
            <Link
              href="/upload"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Capture
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Recent Activity</h3>
            </div>
            <div className="mt-3 divide-y divide-border">
              {activity.slice(0, 5).map((item) => (
                <ActivityItem key={item.id} activity={item} />
              ))}
            </div>
          </div>

          {/* Top Tags */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-medium text-foreground">Popular Tags</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(0, 8).map((tag) => (
                <Link
                  key={tag.name}
                  href={`/search?tag=${tag.name}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-sm transition-colors hover:bg-secondary/80"
                >
                  <span className="text-foreground">{tag.name}</span>
                  <span className="text-xs text-muted-foreground">{tag.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">Latest Insights</h2>
          <Link
            href="/insights"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );
}
