'use client';

import { useEffect, useState } from 'react';
import {
  Cpu,
  HardDrive,
  Database,
  Shield,
  Bell,
  Palette,
  Download,
  Trash2,
  RefreshCw,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchStatus, getApiBase } from '@/lib/api';
import type { SystemStatus } from '@/lib/mock-data';

interface SettingToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function SettingToggle({ label, description, enabled, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-secondary'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            enabled ? 'left-[22px]' : 'left-0.5'
          )}
        />
      </button>
    </div>
  );
}

export function SettingsContent() {
  const [settings, setSettings] = useState({
    localProcessing: true,
    autoIndex: true,
    notifications: true,
    darkMode: true,
    autoBackup: false,
    telemetry: false,
  });

  const [selectedModel, setSelectedModel] = useState('llama-3.2-3b');
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

  const updateSetting = (key: keyof typeof settings) => (value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const storagePercent = (status.storageUsed / status.storageTotal) * 100;

  return (
    <div className="p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure your Brain Dump experience
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI & Processing */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">AI & Processing</h2>
            </div>

            <div className="mt-6 divide-y divide-border">
              <SettingToggle
                label="Local Processing"
                description="Process all data on your device for maximum privacy"
                enabled={settings.localProcessing}
                onChange={updateSetting('localProcessing')}
              />
              <SettingToggle
                label="Auto-Index"
                description="Automatically create embeddings for new content"
                enabled={settings.autoIndex}
                onChange={updateSetting('autoIndex')}
              />

              <div className="py-4">
                <p className="font-medium text-foreground">Local AI Model</p>
                <p className="text-sm text-muted-foreground">
                  Select the model for local processing
                </p>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-3 w-full rounded-lg border border-border bg-secondary/50 px-4 py-2 text-foreground outline-none focus:border-primary"
                >
                  <option value="llama-3.2-1b">Llama 3.2 1B (Fast, Lower Quality)</option>
                  <option value="llama-3.2-3b">Llama 3.2 3B (Balanced)</option>
                  <option value="llama-3.1-8b">Llama 3.1 8B (Best Quality)</option>
                  <option value="phi-3-mini">Phi-3 Mini (Compact)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Storage */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <HardDrive className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">Storage</h2>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used Space</span>
                <span className="font-medium text-foreground">
                  {status.storageUsed} GB / {status.storageTotal} GB
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${storagePercent}%` }}
                />
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Memories</span>
                  <span className="text-foreground">1.8 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Embeddings</span>
                  <span className="text-foreground">0.4 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Models</span>
                  <span className="text-foreground">0.2 GB</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80">
                  <RefreshCw className="h-4 w-4" />
                  Optimize
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive/10 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
                  <Trash2 className="h-4 w-4" />
                  Clear Cache
                </button>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">Privacy</h2>
            </div>

            <div className="mt-6 divide-y divide-border">
              <SettingToggle
                label="Auto Backup"
                description="Automatically backup data to local storage"
                enabled={settings.autoBackup}
                onChange={updateSetting('autoBackup')}
              />
              <SettingToggle
                label="Anonymous Telemetry"
                description="Help improve Brain Dump by sending anonymous usage data"
                enabled={settings.telemetry}
                onChange={updateSetting('telemetry')}
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">Appearance</h2>
            </div>

            <div className="mt-6 divide-y divide-border">
              <SettingToggle
                label="Dark Mode"
                description="Use dark theme for the interface"
                enabled={settings.darkMode}
                onChange={updateSetting('darkMode')}
              />
              <SettingToggle
                label="Notifications"
                description="Show desktop notifications for insights and completions"
                enabled={settings.notifications}
                onChange={updateSetting('notifications')}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-medium text-foreground">System Status</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Local AI</span>
                <span className="flex items-center gap-1.5 text-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-foreground">{status.localAIActive ? 'Active' : 'Fallback'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="flex items-center gap-1.5 text-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-foreground">Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="text-sm text-foreground">
                  {new Date(status.lastSync).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm text-foreground">{getApiBase()}</span>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-medium text-foreground">Export Data</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Download all your memories and connections
            </p>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80">
              <Download className="h-4 w-4" />
              Export as JSON
            </button>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h3 className="font-medium text-destructive">Danger Zone</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              These actions are irreversible
            </p>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-destructive py-2 text-sm font-medium text-white transition-colors hover:bg-destructive/90">
              <Trash2 className="h-4 w-4" />
              Delete All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
