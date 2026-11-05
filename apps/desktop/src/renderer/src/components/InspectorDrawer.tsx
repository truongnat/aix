import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  ShieldCheck,
  Server,
  Brain,
  X,
  Play,
  Clock,
  Terminal,
  CheckCircle2,
  XCircle,
  Power,
  Loader2,
  Plus,
} from 'lucide-react';
import type {
  DesktopSessionSummary,
  DesktopVerificationResult,
  DesktopSystemStatus,
  DesktopMemoryRecord,
} from '@shared/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface InspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeArtifactName: string | null;
  sessions: readonly DesktopSessionSummary[];
  status: DesktopSystemStatus | null;
  onRefreshData?: () => void;
  /** `seq` changes on every request so asking for the same tab again still switches to it. */
  requestedTab?: { readonly tab: DrawerTab; readonly seq: number };
  activeSessionId?: string;
}

export type DrawerTab = 'artifacts' | 'verify' | 'kb' | 'memory';

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  isOpen,
  onClose,
  activeArtifactName,
  sessions,
  status,
  onRefreshData,
  requestedTab,
  activeSessionId,
}) => {
  const [tab, setTab] = useState<DrawerTab>('artifacts');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id ?? '');
  const [currentArtifact, setCurrentArtifact] = useState<string>(activeArtifactName ?? 'PLAN.md');
  const [artifactContent, setArtifactContent] = useState<string>('');
  const [loadingArtifact, setLoadingArtifact] = useState<boolean>(false);

  // Verify Sandbox State
  const [verifyCommand, setVerifyCommand] = useState<string>('pnpm test');
  const [runningVerify, setRunningVerify] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<DesktopVerificationResult | null>(null);

  // KB Service State
  const [togglingKb, setTogglingKb] = useState<boolean>(false);
  const [kbMessage, setKbMessage] = useState<string | null>(null);

  // Memory State
  const [memories, setMemories] = useState<readonly DesktopMemoryRecord[]>([]);
  const [memorySearch, setMemorySearch] = useState<string>('');

  useEffect(() => {
    if (activeArtifactName) {
      setCurrentArtifact(activeArtifactName);
      setTab('artifacts');
    }
  }, [activeArtifactName]);

  useEffect(() => {
    if (requestedTab) setTab(requestedTab.tab);
  }, [requestedTab]);

  useEffect(() => {
    if (activeSessionId) setSelectedSessionId(activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0]?.id ?? '');
    }
  }, [sessions]);

  // Load Artifact content
  useEffect(() => {
    if (!selectedSessionId || !currentArtifact) return;
    setLoadingArtifact(true);
    window.aixAPI
      .getSessionArtifact(selectedSessionId, currentArtifact)
      .then((content) => {
        setArtifactContent(content ?? `No ${currentArtifact} generated in session.`);
      })
      .catch((err: unknown) => {
        setArtifactContent(`Error loading artifact: ${String(err)}`);
      })
      .finally(() => setLoadingArtifact(false));
  }, [selectedSessionId, currentArtifact]);

  // Load Memories
  useEffect(() => {
    if (tab === 'memory') {
      window.aixAPI.listMemories().then(setMemories);
    }
  }, [tab]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRunVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !verifyCommand.trim()) return;
    setRunningVerify(true);
    try {
      const res = await window.aixAPI.runVerify(selectedSessionId, verifyCommand.trim());
      setVerifyResult(res);
    } finally {
      setRunningVerify(false);
    }
  };

  const handleToggleKb = async () => {
    setTogglingKb(true);
    setKbMessage(null);
    const action = status?.kbServiceOnline ? 'stop' : 'start';
    try {
      const res = await window.aixAPI.toggleKbService(action);
      setKbMessage(res.message);
      onRefreshData?.();
    } finally {
      setTogglingKb(false);
      setTimeout(() => setKbMessage(null), 4000);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (!memorySearch.trim()) return true;
    const q = memorySearch.toLowerCase();
    return m.title.toLowerCase().includes(q) || m.body.toLowerCase().includes(q);
  });

  return (
    <aside className="w-[440px] bg-surface border-l border-white/5 flex flex-col h-full shrink-0 z-20">
      {/* Drawer Header with Tabs */}
      <div className="h-12 px-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab('artifacts')}
            className={`px-2.5 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
              tab === 'artifacts' ? 'bg-white/[0.07] text-white' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" /> Artifacts
          </button>
          <button
            type="button"
            onClick={() => setTab('verify')}
            className={`px-2.5 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
              tab === 'verify' ? 'bg-white/[0.07] text-white' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verify
          </button>
          <button
            type="button"
            onClick={() => setTab('kb')}
            className={`px-2.5 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
              tab === 'kb' ? 'bg-white/[0.07] text-white' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> KB Server
          </button>
          <button
            type="button"
            onClick={() => setTab('memory')}
            className={`px-2.5 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
              tab === 'memory' ? 'bg-white/[0.07] text-white' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Memory
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Inspector Drawer"
          title="Close drawer (Esc)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Artifacts Viewer */}
        {tab === 'artifacts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Session Artifacts
              </span>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono max-w-[200px] truncate"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id} className="bg-surface-elevated text-white">
                    {s.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Artifact Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['DISCUSSION.md', 'PLAN.md', 'REVIEW.md', 'VERIFY.md', 'REMEMBER.md'].map((art) => (
                <button
                  key={art}
                  type="button"
                  onClick={() => setCurrentArtifact(art)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                    currentArtifact === art
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold'
                      : 'bg-white/[0.02] text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {art.replace('.md', '')}
                </button>
              ))}
            </div>

            {/* Rendered Artifact Content */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              {loadingArtifact ? (
                <div className="text-slate-500 text-xs py-10 text-center">Loading artifact...</div>
              ) : (
                <MarkdownRenderer content={artifactContent} />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Verify Sandbox */}
        {tab === 'verify' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">Execute Sandbox Test</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Runs strictly whitelisted test runners in isolated <code className="text-slate-300">generated/</code> sandbox.
              </p>
            </div>

            <form onSubmit={handleRunVerify} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Target Session:</label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id} className="bg-surface-elevated text-white">
                      {s.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Test Command:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={verifyCommand}
                    onChange={(e) => setVerifyCommand(e.target.value)}
                    placeholder="e.g. pnpm test, pytest -v"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={runningVerify}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Run
                  </button>
                </div>
              </div>
            </form>

            {/* Terminal Result */}
            {verifyResult && (
              <div className="rounded-xl bg-black border border-white/10 overflow-hidden text-xs font-mono shadow-xl">
                <div className="p-2.5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5 truncate">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    {verifyResult.command}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      verifyResult.ok
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    EXIT {verifyResult.exitCode}
                  </span>
                </div>
                <div className="p-3 max-h-56 overflow-y-auto space-y-2">
                  {verifyResult.stdout && (
                    <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed text-[11px]">
                      {verifyResult.stdout}
                    </pre>
                  )}
                  {verifyResult.stderr && (
                    <pre className="text-rose-300/90 whitespace-pre-wrap leading-relaxed text-[11px]">
                      {verifyResult.stderr}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: KB Server Controller */}
        {tab === 'kb' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">Knowledge Base Service (NestJS + SQLite)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Provides HTTP API and full-text search on port 4000.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status?.kbServiceOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  Status: {status?.kbServiceOnline ? 'Online (Active)' : 'Offline'}
                </span>
                <span className="text-[11px] font-mono text-slate-500">Port {status?.kbPort ?? 4000}</span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  disabled={togglingKb}
                  onClick={handleToggleKb}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    status?.kbServiceOnline
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  {togglingKb ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Power className="w-3.5 h-3.5" />
                  )}
                  {status?.kbServiceOnline ? 'Stop KB Server' : 'Launch KB Server'}
                </button>
              </div>
            </div>

            {kbMessage && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                {kbMessage}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Memory Hub Quick View */}
        {tab === 'memory' && (
          <div className="space-y-3">
            <input
              type="text"
              value={memorySearch}
              onChange={(e) => setMemorySearch(e.target.value)}
              placeholder="Search past solutions..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />

            <div className="space-y-2">
              {filteredMemories.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{m.title}</span>
                    <span className="text-[9px] uppercase font-semibold text-purple-400">{m.kind}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
