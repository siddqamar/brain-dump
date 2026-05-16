import {
  FileText,
  Image,
  Link,
  Video,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MemoryType } from '@/lib/mock-data';

const typeConfig: Record<MemoryType, { icon: typeof FileText; color: string; label: string }> = {
  screenshot: { icon: Image, color: 'text-emerald-500', label: 'Screenshot' },
  pdf: { icon: FileText, color: 'text-orange-500', label: 'PDF' },
  link: { icon: Link, color: 'text-blue-500', label: 'Link' },
  text: { icon: Type, color: 'text-purple-500', label: 'Text' },
  youtube: { icon: Video, color: 'text-red-500', label: 'YouTube' },
};

interface MemoryTypeIconProps {
  type: MemoryType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function MemoryTypeIcon({ type, size = 'md', showLabel = false }: MemoryTypeIconProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn(sizeClasses[size], config.color)} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}

export function MemoryTypeBadge({ type }: { type: MemoryType }) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5">
      <Icon className={cn('h-3 w-3', config.color)} />
      <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
    </div>
  );
}
