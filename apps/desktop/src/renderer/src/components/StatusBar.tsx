import React from 'react';
import {
  Cpu,
  Server,
  Brain,
  GitBranch,
  Folder,
} from 'lucide-react';
import type { DesktopSystemStatus } from '@shared/api';
import type { NavTab } from './Sidebar';

interface StatusBarProps {
  status: DesktopSystemStatus | null;
  onNavigate: (tab: NavTab) => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status, onNavigate }) => {
  return (
    <footer className="h-7 bg-surface border-t border-white/5 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none z-40">
      {/* Left: AI Model Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-1.5 hover:text-white transition-colors group"
        >
          <Cpu className="w-3 h-3 text-blue-400" />
          <span className="font-semibold text-slate-300 group-hover:text-blue-400 uppercase text-[10px]">
            {status?.activeAiProvider ?? 'Anthropic'}:
          </span>
          <span className="font-mono text-slate-400">{status?.activeAiModel ?? 'claude-3-5-sonnet'}</span>
        </button>

        <span className="text-white/10">•</span>

        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] truncate max-w-xs">
          <Folder className="w-3 h-3 text-slate-600" />
          <span className="truncate">{status?.cwd ?? 'aix'}</span>
        </div>
      </div>

      {/* Right: KB Server, Memory count, Git branch */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('memory')}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <Server className="w-3 h-3 text-slate-500" />
          <span
            className={`flex items-center gap-1 text-[10px] font-semibold ${
              status?.kbServiceOnline ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status?.kbServiceOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            KB {status?.kbPort ?? 4000}: {status?.kbServiceOnline ? 'Online' : 'Offline'}
          </span>
        </button>

        <span className="text-white/10">•</span>

        <button
          onClick={() => onNavigate('memory')}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <Brain className="w-3 h-3 text-purple-400" />
          <span>{status?.memoryCount ?? 0} Memories</span>
        </button>

        <span className="text-white/10">•</span>

        <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
          <GitBranch className="w-3 h-3 text-slate-500" />
          <span>main</span>
        </div>
      </div>
    </footer>
  );
};
