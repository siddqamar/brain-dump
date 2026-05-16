'use client';

import { useState, useCallback } from 'react';
import {
  Upload,
  Link,
  FileText,
  Image,
  Video,
  Type,
  X,
  Loader2,
  Check,
  AlertCircle,
  Clipboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { captureFile, captureText, captureUrl } from '@/lib/api';

type CaptureType = 'link' | 'text' | 'file' | 'youtube';

interface QueueItem {
  id: string;
  type: CaptureType;
  title: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  progress?: number;
}

const captureTypes: {
  id: CaptureType;
  label: string;
  icon: typeof Link;
  description: string;
  placeholder: string;
}[] = [
  {
    id: 'link',
    label: 'Web Link',
    icon: Link,
    description: 'Article, blog post, or documentation',
    placeholder: 'https://example.com/article',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: Video,
    description: 'Video transcript and metadata',
    placeholder: 'https://youtube.com/watch?v=...',
  },
  {
    id: 'text',
    label: 'Text Note',
    icon: Type,
    description: 'Quick notes or copied text',
    placeholder: 'Paste or type your notes here...',
  },
  {
    id: 'file',
    label: 'File Upload',
    icon: FileText,
    description: 'PDF, image, or screenshot',
    placeholder: '',
  },
];

export function UploadContent() {
  const [activeType, setActiveType] = useState<CaptureType>('link');
  const [inputValue, setInputValue] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([
    { id: '1', type: 'link', title: 'React Performance Tips', status: 'complete' },
    { id: '2', type: 'youtube', title: 'System Design Interview', status: 'processing', progress: 65 },
    { id: '3', type: 'file', title: 'architecture-diagram.pdf', status: 'queued' },
  ]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const parsedTags = () =>
    tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

  const processFile = useCallback(async (file: File) => {
    const id = `${Date.now()}-${file.name}`;
    setQueue((prev) => [
      ...prev,
      {
        id,
        type: 'file',
        title: file.name,
        status: 'processing',
        progress: 20,
      },
    ]);

    try {
      await captureFile(file, parsedTags());
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'complete', progress: 100 } : item))
      );
    } catch {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'error' } : item))
      );
    }
  }, [tags]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => processFile(file));
  }, [processFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && activeType !== 'file') return;

    const newItem: QueueItem = {
      id: Date.now().toString(),
      type: activeType,
      title: activeType === 'text' ? textTitle || 'Untitled Note' : inputValue,
      status: 'processing',
      progress: 20,
    };

    setQueue((prev) => [...prev, newItem]);

    try {
      if (activeType === 'text') {
        await captureText({ title: textTitle || undefined, content: inputValue, tags: parsedTags() });
      } else if (activeType === 'link' || activeType === 'youtube') {
        await captureUrl({ url: inputValue, tags: parsedTags(), type: activeType });
      }
      setQueue((prev) =>
        prev.map((item) => (item.id === newItem.id ? { ...item, status: 'complete', progress: 100 } : item))
      );
      setInputValue('');
      setTextTitle('');
      setTags('');
    } catch {
      setQueue((prev) =>
        prev.map((item) => (item.id === newItem.id ? { ...item, status: 'error' } : item))
      );
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputValue(text);
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const activeConfig = captureTypes.find((t) => t.id === activeType)!;

  return (
    <div className="p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Capture</h1>
        <p className="mt-1 text-muted-foreground">
          Add new knowledge to your memory system
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main Capture Form */}
        <div className="lg:col-span-2">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {captureTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setActiveType(type.id);
                  setInputValue('');
                }}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
                  activeType === type.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                <type.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <activeConfig.icon className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-foreground">{activeConfig.label}</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeConfig.description}
              </p>

              {activeType === 'file' ? (
                /* File Upload Area */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    'mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-center text-foreground">
                    Drag and drop files here, or{' '}
                    <label className="cursor-pointer text-primary hover:underline">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
                        onChange={(event) => {
                          Array.from(event.target.files || []).forEach((file) => processFile(file));
                          event.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Supports PDF, PNG, JPG, WEBP (max 10MB)
                  </p>
                </div>
              ) : activeType === 'text' ? (
                /* Text Input */
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm text-muted-foreground">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={textTitle}
                      onChange={(e) => setTextTitle(e.target.value)}
                      placeholder="Give your note a title..."
                      className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-2 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-muted-foreground">
                      Content
                    </label>
                    <div className="relative">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={activeConfig.placeholder}
                        rows={6}
                        className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={handlePaste}
                        className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Clipboard className="h-3 w-3" />
                        Paste
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* URL Input */
                <div className="mt-4">
                  <div className="relative">
                    <input
                      type="url"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={activeConfig.placeholder}
                      className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Clipboard className="h-3 w-3" />
                      Paste
                    </button>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="mt-4">
                <label className="mb-1.5 block text-sm text-muted-foreground">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="react, tutorial, performance"
                  className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-2 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!inputValue.trim() && activeType !== 'file'}
                className="mt-6 w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to Memory
              </button>
            </div>
          </form>
        </div>

        {/* Processing Queue */}
        <div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-medium text-foreground">Processing Queue</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {queue.filter((i) => i.status === 'processing').length} items processing
            </p>

            <div className="mt-4 space-y-3">
              {queue.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No items in queue
                </p>
              ) : (
                queue.map((item) => {
                  const typeConfig = captureTypes.find((t) => t.id === item.type)!;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
                    >
                      <typeConfig.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        {item.status === 'processing' && (
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${item.progress || 0}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'queued' && (
                          <span className="text-xs text-muted-foreground">Queued</span>
                        )}
                        {item.status === 'processing' && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {item.status === 'complete' && (
                          <Check className="h-4 w-4 text-emerald-500" />
                        )}
                        {item.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <button
                          onClick={() => removeFromQueue(item.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-4 rounded-xl border border-border bg-card p-6">
            <h3 className="font-medium text-foreground">Tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Paste any URL and we&apos;ll extract the content
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                YouTube videos are transcribed automatically
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                PDFs and images are processed with OCR
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                All processing happens locally on your device
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
