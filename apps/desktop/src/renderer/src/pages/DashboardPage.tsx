import React from 'react';
import {
  Boxes,
  Brain,
  FolderGit2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Play,
  Terminal,
  Cpu,
  Sliders,
} from 'lucide-react';
import type { DesktopSystemStatus, DesktopSessionSummary } from '@shared/api';
import type { NavTab } from '../components/Sidebar';
import { PageHeader } from '../components/ui/PageHeader';

interface DashboardPageProps {
  status: DesktopSystemStatus | null;
  sessions: readonly DesktopSessionSummary[];
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ status, sessions, onNavigate }) => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome */}
      <PageHeader
        title="Engineering Mission Control"
        description="Governing multi-agent workflows with the 8-step engineering spine, verified skills, and inspectable execution."
        actions={
          <button
            onClick={() => onNavigate('spine')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/25"
          >
            <Play className="w-4 h-4 fill-white" /> Start New Spine Run
          </button>
        }
      />
      {/* Active AI Intelligence Widget */}
      <div className="p-4 rounded-2xl bg-surface border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Active AI Intelligence:</span>
              <span className="font-bold text-sm text-white uppercase">{status?.activeAiProvider ?? 'Anthropic'}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {status?.activeAiModel ?? 'claude-3-5-sonnet'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Powering the 8-step spine (Architect, Planner, Coder, Reviewer, Verifier).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-all border border-white/10"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" /> Switch Model / API Key
          </button>
        </div>
      </div>


      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Canonical Skills</span>
            <Boxes className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{status?.skillsCount ?? 160}</div>
          <div className="text-xs text-slate-500">Structured across 9 categories</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Memory Records</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{status?.memoryCount ?? 0}</div>
          <div className="text-xs text-slate-500">Tier 1 local Markdown in .aix/</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Spine Sessions</span>
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{sessions.length}</div>
          <div className="text-xs text-slate-500">In .aix/sessions/</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Command Policy</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{status ? 'Applied' : '—'}</div>
          <div className="text-xs text-slate-400 font-medium">Verify command allowlist only; no OS process sandbox</div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Engineering Sessions</h2>
            <button
              onClick={() => onNavigate('spine')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No recorded sessions found in <code className="text-slate-400">.aix/sessions/</code>.
            </div>
          ) : (
            <div className="space-y-2.5">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-white flex items-center gap-2">
                      {session.id}
                      {session.phase && (
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {session.phase}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Artifacts: {session.artifacts.join(', ') || 'None'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('verify')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all text-xs flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5" /> Verify
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launch & Guidance */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Methodology Quick Start</h2>
          <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-1.5">
              <span className="font-semibold text-blue-400 block">1. The 8-Step Spine</span>
              <p>Discuss → Plan → Worktree → TDD → Execute → Review → Verify → Remember.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-1.5">
              <span className="font-semibold text-purple-400 block">2. Single Source of Truth</span>
              <p>All 160 skills are organized under root <code className="text-slate-300">skills/</code> across 9 distinct categories.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-1.5">
              <span className="font-semibold text-amber-400 block flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> 3. Verification Gating
              </span>
              <p>Never conclude tasks without executing real tests in the session sandbox.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
