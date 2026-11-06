import React from 'react';
import {
  LayoutDashboard,
  Workflow,
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Server,
  Layers,
  Sliders,
  MessageSquareCode,
  Plus,
} from 'lucide-react';
import type { DesktopSystemStatus } from '@shared/api';

export type NavTab = 'chat' | 'dashboard' | 'spine' | 'skills' | 'memory' | 'verify' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  status: DesktopSystemStatus | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, status }) => {
  const navItems = [
    { id: 'chat' as NavTab, label: 'Agent Chat Canvas', icon: MessageSquareCode },
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'spine' as NavTab, label: 'Engineering Spine', icon: Workflow },
    { id: 'skills' as NavTab, label: `Skill Library (${status?.skillsCount ?? '…'})`, icon: Sparkles },
    { id: 'memory' as NavTab, label: 'Memory Hub', icon: BrainCircuit },
    { id: 'verify' as NavTab, label: 'Test Runner', icon: ShieldCheck },
    { id: 'settings' as NavTab, label: 'AI Model Hub', icon: Sliders },
  ];

  return (
    <aside className="w-60 bg-surface border-r border-white/5 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-2">
              aix
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Desktop
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Mission Control</div>
          </div>
        </div>

        {/* Quick Launch Action */}
        <div className="p-3 pb-1">
          <button
            type="button"
            onClick={() => onSelectTab('chat')}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Launch New Task
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors border ${
                  isActive
                    ? 'bg-white/[0.05] text-white border-white/5'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-4 m-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Server className="w-3.5 h-3.5" /> KB Service
          </span>
          <span
            className={`flex items-center gap-1.5 text-[11px] font-semibold ${
              status?.kbServiceOnline ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status?.kbServiceOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            {status?.kbServiceOnline ? 'Online' : status ? 'Offline' : 'Checking…'}
          </span>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Skills: {status?.skillsCount ?? '—'}</span>
          <span>Node {status?.nodeVersion ?? '—'}</span>
        </div>
      </div>
    </aside>
  );
};
