import React, { useState, useEffect, useId } from 'react';
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
import { ConfirmDialog } from './ui/Modal';

interface InspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeArtifactName: string | null;
  sessions: readonly DesktopSessionSummary[];
  status: DesktopSystemStatus | null;
  onRefreshData?: () => void;
  /** `seq` changes on every request so asking for the same tab again still switches to it. */
  requestedTab?: { readonly tab: DrawerTab; readonly seq: number };
  activeSessionId?: string | null;
  width?: number;
}

export type DrawerTab = 'artifacts' | 'verify' | 'kb' | 'memory';

const DRAWER_TABS: readonly { tab: DrawerTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { tab: 'artifacts', label: 'Artifacts', icon: FileCode2 },
  { tab: 'verify', label: 'Verify', icon: ShieldCheck },
  { tab: 'kb', label: 'KB Server', icon: Server },
  { tab: 'memory', label: 'Memory', icon: Brain },
];

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  isOpen,
  onClose,
  activeArtifactName,
  sessions,
  status,
  onRefreshData,
  requestedTab,
  activeSessionId,
  width,
}) => {
  const [tab, setTab] = useState<DrawerTab>('artifacts');
  const effectiveSessionId = activeSessionId ?? '';
  const activeSession = sessions.find((session) => session.id === effectiveSessionId);
  const sessionTitle = effectiveSessionId ? activeSession?.title ?? 'Loading session…' : 'New task';
  const [currentArtifact, setCurrentArtifact] = useState<string>(activeArtifactName ?? 'PLAN.md');
  const [artifactContent, setArtifactContent] = useState<string>('');
  const [loadingArtifact, setLoadingArtifact] = useState<boolean>(false);
  const [generatedFiles, setGeneratedFiles] = useState<readonly string[]>([]);
  const [activeGeneratedPath, setActiveGeneratedPath] = useState<string | null>(null);
  const [filesError, setFilesError] = useState<string | null>(null);

  // Verify Sandbox State
  const [verifyCommand, setVerifyCommand] = useState<string>('pnpm test');
  const [runningVerify, setRunningVerify] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<DesktopVerificationResult | null>(null);
  const [pendingVerify, setPendingVerify] = useState<string | null>(null);

  // KB Service State
  const [togglingKb, setTogglingKb] = useState<boolean>(false);
  const [kbMessage, setKbMessage] = useState<string | null>(null);

  // Memory State
  const [memories, setMemories] = useState<readonly DesktopMemoryRecord[]>([]);
  const [memorySearch, setMemorySearch] = useState<string>('');
  const verifyCommandId = useId();

  useEffect(() => {
    if (activeArtifactName) {
      setCurrentArtifact(activeArtifactName);
      setActiveGeneratedPath(null);
      setTab('artifacts');
    }
  }, [activeArtifactName]);

  useEffect(() => {
    if (requestedTab) setTab(requestedTab.tab);
  }, [requestedTab]);

  useEffect(() => {
    setVerifyResult(null);
    setPendingVerify(null);
    setActiveGeneratedPath(null);
    setGeneratedFiles([]);
    setFilesError(null);
  }, [effectiveSessionId]);

  useEffect(() => {
    if (!effectiveSessionId || !isOpen || tab !== 'artifacts') return;
    let cancelled = false;
    window.aixAPI.listSessionFiles(effectiveSessionId).then((files) => {
      if (!cancelled) { setGeneratedFiles(files); setFilesError(null); }
    }).catch((error: unknown) => {
      if (!cancelled) setFilesError(`Could not load generated files: ${String(error)}. Reopen Inspector to retry.`);
    });
    return () => { cancelled = true; };
  }, [effectiveSessionId, activeSession?.updatedAt, isOpen, tab]);

  // Never let a previous session's late artifact response replace the current one.
  useEffect(() => {
    if (!effectiveSessionId) {
      setArtifactContent('Start or select a task to view its artifacts.');
      setLoadingArtifact(false);
      return;
    }
    if (!isOpen || tab !== 'artifacts') return;
    let cancelled = false;
    setArtifactContent('');
    setLoadingArtifact(true);
    const content = activeGeneratedPath
      ? window.aixAPI.readSessionFile(effectiveSessionId, activeGeneratedPath)
      : window.aixAPI.getSessionArtifact(effectiveSessionId, currentArtifact);
    content
      .then((content) => {
        if (!cancelled) setArtifactContent(content ?? `No ${currentArtifact} generated in session.`);
      })
      .catch((err: unknown) => {
        if (!cancelled) setArtifactContent(`Error loading artifact: ${String(err)}`);
      })
      .finally(() => { if (!cancelled) setLoadingArtifact(false); });
    return () => { cancelled = true; };
  }, [effectiveSessionId, currentArtifact, activeGeneratedPath, activeSession?.updatedAt, isOpen, tab]);

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

  const handleRunVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveSessionId || !verifyCommand.trim()) return;
    setPendingVerify(verifyCommand.trim());
  };

  const executeVerify = async (command: string) => {
    setRunningVerify(true);
    try {
      const res = await window.aixAPI.runVerify(effectiveSessionId, command);
      setVerifyResult(res);
    } catch (error: unknown) {
      setVerifyResult({
        ok: false,
        exitCode: 1,
        command: verifyCommand.trim(),
        stdout: '',
        stderr: `Could not run or save verification evidence: ${String(error)}`,
        durationMs: 0,
        generatedFilesCount: 0,
      });
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
    <aside
      style={{ width: width ? `${width}px` : undefined }}
      className={`${width ? '' : 'w-[440px]'} bg-surface border-l border-white/5 flex flex-col h-full shrink-0 z-20 overflow-hidden`}
    >
      {/* Drawer Header with Tabs */}
      <div className="h-12 px-3 border-b border-white/5 flex items-center justify-between gap-2">
        <div role="group" aria-label="Inspector sections" className="flex min-w-0 items-center gap-1">
          {DRAWER_TABS.map(({ tab: id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
              className={`min-h-8 px-2.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                tab === id ? 'bg-white/[0.07] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Inspector Drawer"
          title="Close drawer (Esc)"
          className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Artifacts Viewer */}
        {tab === 'artifacts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Session Artifacts
              </span>
            <span
              className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded truncate max-w-[260px]"
              title={effectiveSessionId ? `${sessionTitle}\n${effectiveSessionId}` : 'New task'}
            >
              {sessionTitle}
            </span>
            </div>

            {/* Artifact Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['DISCUSSION.md', 'PLAN.md', 'REVIEW.md', 'VERIFY.md', 'REMEMBER.md'].map((art) => (
                <button
                  key={art}
                  type="button"
                  aria-pressed={activeGeneratedPath === null && currentArtifact === art}
                  onClick={() => { setActiveGeneratedPath(null); setCurrentArtifact(art); }}
                  className={`shrink-0 min-h-7 px-2.5 rounded-lg text-[12px] font-mono font-semibold border transition-colors ${
                    activeGeneratedPath === null && currentArtifact === art
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                      : 'bg-white/[0.02] text-slate-400 hover:text-white border-white/5'
                  }`}
                >
                  {art.replace('.md', '')}
                </button>
              ))}
            </div>

            <section aria-label="Generated files" className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">Generated files ({generatedFiles.length})</h3>
              {filesError && <p role="alert" className="text-xs text-rose-300">{filesError}</p>}
              {generatedFiles.length === 0 ? (
                <p className="text-xs text-slate-400">Source files appear here after code generation.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {generatedFiles.map(path => (
                    <button key={path} type="button" title={path}
                      aria-pressed={activeGeneratedPath === path}
                      onClick={() => setActiveGeneratedPath(path)}
                      className={`block w-full px-2.5 py-2 rounded-md text-left text-xs font-mono break-all transition-colors ${activeGeneratedPath === path ? 'bg-blue-500/15 text-blue-200' : 'text-slate-300 hover:bg-white/5'}`}
                    >{path}</button>
                  ))}
                </div>
              )}
            </section>

            {/* Rendered Artifact Content */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              {loadingArtifact ? (
                <div className="text-slate-400 text-xs py-10 text-center" role="status">Loading artifact…</div>
              ) : activeGeneratedPath ? (
                <div>
                  <h3 className="text-xs text-slate-300 font-mono mb-3 break-all">{activeGeneratedPath}</h3>
                  <pre className="overflow-x-auto text-xs leading-relaxed text-slate-200"><code>{artifactContent}</code></pre>
                </div>
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
              <p className="text-[12px] text-slate-400 leading-relaxed">
                Runs a whitelisted command in <code className="text-slate-300">generated/</code> with your normal account permissions. This is not an OS sandbox; review generated scripts before running them.
              </p>
            </div>

            <form onSubmit={handleRunVerify} className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="block text-[11px] uppercase font-bold text-slate-400">Target Session</span>
                  <span
                    className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded truncate max-w-[260px]"
                    title={effectiveSessionId ? `${sessionTitle}\n${effectiveSessionId}` : 'New task'}
                  >
                    {sessionTitle}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor={verifyCommandId} className="block text-[11px] uppercase font-bold text-slate-400">Test Command</label>
                <div className="flex gap-2">
                  <input
                    id={verifyCommandId}
                    type="text"
                    required
                    value={verifyCommand}
                    onChange={(e) => setVerifyCommand(e.target.value)}
                    placeholder="e.g. pnpm test, pytest -v"
                    className="flex-1 min-w-0 min-h-8 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={runningVerify}
                    className="shrink-0 min-h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    {runningVerify ? (
                      <Loader2 className="w-3.5 h-3.5 motion-safe:animate-spin" aria-hidden="true" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white" aria-hidden="true" />
                    )}
                    Run
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
              <p className="text-[12px] text-slate-400 leading-relaxed">
                Provides HTTP API and full-text search on port 4000.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`w-2 h-2 rounded-full ${
                      status?.kbServiceOnline ? 'bg-emerald-400 motion-safe:animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  Status: {status?.kbServiceOnline ? 'Online (Active)' : 'Offline'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">Port {status?.kbPort ?? 4000}</span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  disabled={togglingKb}
                  onClick={handleToggleKb}
                  className={`flex-1 min-h-9 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 ${
                    status?.kbServiceOnline
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  {togglingKb ? (
                    <Loader2 className="w-3.5 h-3.5 motion-safe:animate-spin" aria-hidden="true" />
                  ) : (
                    <Power className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {status?.kbServiceOnline ? 'Stop KB Server' : 'Launch KB Server'}
                </button>
              </div>
            </div>

            {kbMessage && (
              <div role="status" className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                {kbMessage}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Memory Hub Quick View */}
        {tab === 'memory' && (
          <div className="space-y-3">
            <input
              type="search"
              aria-label="Search memories"
              value={memorySearch}
              onChange={(e) => setMemorySearch(e.target.value)}
              placeholder="Search past solutions…"
              className="w-full min-h-8 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />

            <div className="space-y-2">
              {filteredMemories.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 break-words font-bold text-xs text-white">{m.title}</span>
                    <span className="shrink-0 text-[11px] uppercase font-semibold text-purple-300">{m.kind}</span>
                  </div>
                  <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingVerify !== null}
        title="Run local verification command?"
        message="This command is not sandboxed and will run with your account permissions. Review generated scripts before continuing."
        detail={pendingVerify ?? ''}
        confirmLabel="Run command"
        destructive
        onConfirm={() => {
          const command = pendingVerify;
          setPendingVerify(null);
          if (command) void executeVerify(command);
        }}
        onCancel={() => setPendingVerify(null)}
      />
    </aside>
  );
};
