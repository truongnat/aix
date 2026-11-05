import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { SpinePipelineVisualizer } from '../components/SpinePipelineVisualizer';
import {
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  ThumbsUp,
  RotateCcw,
  XCircle,
  FileCode2,
  Play,
  Terminal,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import type { DesktopSessionSummary, DesktopHitlRequest, DesktopSpineEvent } from '@shared/api';
import type { Phase } from '@x/core';

interface SpinePageProps {
  sessions: readonly DesktopSessionSummary[];
  onRefreshSessions?: () => void;
}

const SPINE_STEPS: { id: Phase | 'worktree' | 'tdd'; label: string; desc: string; artifact: string | null }[] = [
  { id: 'discuss', label: '1. Discuss', desc: 'Align on success & trade-offs', artifact: 'DISCUSSION.md' },
  { id: 'plan', label: '2. Plan', desc: 'Break down verifiable tasks', artifact: 'PLAN.md' },
  { id: 'worktree', label: '3. Worktree', desc: 'Clean baseline & branch isolation', artifact: null },
  { id: 'tdd', label: '4. TDD', desc: 'Write failing test first (RED)', artifact: null },
  { id: 'run', label: '5. Execute', desc: 'Minimal code to pass (GREEN)', artifact: null },
  { id: 'run', label: '6. Review', desc: 'Security & quality audit', artifact: 'REVIEW.md' },
  { id: 'verify', label: '7. Verify', desc: 'Concrete evidence validation', artifact: 'VERIFY.md' },
  { id: 'remember', label: '8. Remember', desc: 'Durable lessons & memory', artifact: 'REMEMBER.md' },
];

export const SpinePage: React.FC<SpinePageProps> = ({ sessions, onRefreshSessions }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id ?? '');
  const [activeArtifact, setActiveArtifact] = useState<string>('PLAN.md');
  const [artifactContent, setArtifactContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState<boolean>(false);

  // Live Task Runner State
  const [showStartModal, setShowStartModal] = useState<boolean>(false);
  const [taskPrompt, setTaskPrompt] = useState<string>('');
  const [runMode, setRunMode] = useState<'guided' | 'auto'>('guided');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentRunningPhase, setCurrentRunningPhase] = useState<Phase | null>(null);
  const [logs, setLogs] = useState<{ message: string; timestamp: string }[]>([]);
  const [pendingHitl, setPendingHitl] = useState<DesktopHitlRequest | null>(null);
  const [hitlNote, setHitlNote] = useState<string>('');

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0]?.id ?? '');
    }
  }, [sessions]);

  // Load artifact content
  useEffect(() => {
    if (!selectedSessionId || !activeArtifact) return;
    setLoadingContent(true);
    window.aixAPI
      .getSessionArtifact(selectedSessionId, activeArtifact)
      .then((content) => {
        setArtifactContent(content ?? `No ${activeArtifact} found in session ${selectedSessionId}.`);
      })
      .catch((err: unknown) => {
        setArtifactContent(`Error loading artifact: ${String(err)}`);
      })
      .finally(() => setLoadingContent(false));
  }, [selectedSessionId, activeArtifact]);

  // Live Event Streaming Listener
  useEffect(() => {
    if (!window.aixAPI?.onSpineEvent) return;
    const unsub = window.aixAPI.onSpineEvent((event: DesktopSpineEvent) => {
      if (event.type === 'log') {
        setLogs((prev) => [...prev, { message: event.message, timestamp: event.timestamp }]);
      } else if (event.type === 'phase') {
        setCurrentRunningPhase(event.phase);
      } else if (event.type === 'hitl') {
        setPendingHitl(event.request);
      } else if (event.type === 'complete') {
        setIsRunning(false);
        setPendingHitl(null);
        setCurrentRunningPhase(null);
        setLogs((prev) => [
          ...prev,
          { message: `Session ${event.sessionId} completed successfully!`, timestamp: new Date().toLocaleTimeString() },
        ]);
        setSelectedSessionId(event.sessionId);
        onRefreshSessions?.();
      } else if (event.type === 'aborted') {
        setIsRunning(false);
        setPendingHitl(null);
        setCurrentRunningPhase(null);
        setLogs((prev) => [
          ...prev,
          { message: `Session ${event.sessionId} stopped by user`, timestamp: new Date().toLocaleTimeString() },
        ]);
      } else if (event.type === 'error') {
        setIsRunning(false);
        setLogs((prev) => [
          ...prev,
          { message: `CRITICAL ERROR: ${event.error}`, timestamp: new Date().toLocaleTimeString() },
        ]);
      }
    });

    return unsub;
  }, [onRefreshSessions]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const handleStartRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskPrompt.trim() || isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setPendingHitl(null);
    setShowStartModal(false);

    try {
      const { sessionId } = await window.aixAPI.startSpine(taskPrompt.trim(), runMode);
      setSelectedSessionId(sessionId);
    } catch (err: unknown) {
      setIsRunning(false);
      setLogs([{ message: `Failed to start spine: ${String(err)}`, timestamp: new Date().toLocaleTimeString() }]);
    }
  };

  const handleHitlResponse = async (decision: 'approve' | 'revise' | 'cancel') => {
    if (!pendingHitl) return;
    const reqId = pendingHitl.id;
    setPendingHitl(null);
    await window.aixAPI.respondHitl(reqId, decision, hitlNote.trim() || undefined);
    setHitlNote('');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Session Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Engineering Spine Controller
            {isRunning && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Live Run Active
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Governing the 8-step engineering methodology, artifact generation, and human approval gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStartModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-lg shadow-blue-600/25"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Launch Spine Task
          </button>

          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Session:</label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id} className="bg-surface-elevated text-white">
                {s.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 8-Step Interactive Stepper Visualizer */}
      <SpinePipelineVisualizer
        currentPhase={currentRunningPhase}
        activeArtifact={activeArtifact}
        availableArtifacts={selectedSession?.artifacts ?? []}
        onSelectArtifact={setActiveArtifact}
      />

      {/* Live Logs Terminal (when running or has logs) */}
      {logs.length > 0 && (
        <div className="rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex flex-col shadow-2xl">
          <div className="p-3 bg-white/[0.04] border-b border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" /> Engine Execution Log
            </span>
            <span className="text-[11px] text-slate-500">{logs.length} messages</span>
          </div>
          <div className="p-4 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 text-slate-300">
                <span className="text-slate-600 text-[10px]">{log.timestamp}</span>
                <span className={log.message.startsWith('ERROR') ? 'text-rose-400 font-bold' : ''}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artifact Viewer & HITL Gate Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Artifact Content Viewer */}
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col overflow-hidden">
          {/* Artifact Tabs Header */}
          <div className="p-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-2 overflow-x-auto">
            {['DISCUSSION.md', 'PLAN.md', 'REVIEW.md', 'VERIFY.md', 'REMEMBER.md'].map((art) => (
              <button
                key={art}
                onClick={() => setActiveArtifact(art)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                  activeArtifact === art
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                {art}
              </button>
            ))}
          </div>

          {/* Artifact Code / Text Viewer */}
          <div className="p-6 flex-1 min-h-[380px] overflow-auto">
            {loadingContent ? (
              <div className="text-slate-500 text-sm py-12 text-center">Loading artifact content...</div>
            ) : (
              <MarkdownRenderer content={artifactContent} />
            )}
          </div>
        </div>

        {/* Human-In-The-Loop Approval Box */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <AlertCircle className={`w-4 h-4 ${pendingHitl ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
              Human-In-The-Loop (HITL) Gate
            </div>

            {pendingHitl ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-300 block">{pendingHitl.question}</span>
                <div className="space-y-1">
                  {pendingHitl.options.map((opt) => (
                    <div key={opt.id} className="text-[11px] text-slate-300">
                      • <strong className="text-white">{opt.label}:</strong> {opt.summary}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Review generated artifacts before advancing to execution. Enforces strict fail-closed security.
              </p>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Revision Notes (optional):
              </label>
              <textarea
                value={hitlNote}
                onChange={(e) => setHitlNote(e.target.value)}
                placeholder="Specify changes needed before approval..."
                className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none font-sans"
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/5">
            <button
              onClick={() => handleHitlResponse('approve')}
              disabled={!pendingHitl}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium text-xs transition-all shadow-lg shadow-emerald-600/20"
            >
              <ThumbsUp className="w-3.5 h-3.5" /> Approve & Advance Phase
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleHitlResponse('revise')}
                disabled={!pendingHitl}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40 text-amber-400 border border-amber-500/20 font-medium text-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Request Revise
              </button>
              <button
                onClick={() => handleHitlResponse('cancel')}
                disabled={!pendingHitl}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 text-rose-400 border border-rose-500/20 font-medium text-xs transition-all"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Run
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Start Task Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <form
            onSubmit={handleStartRun}
            className="bg-surface-elevated border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> Start New Spine Task
              </h2>
              <button
                type="button"
                onClick={() => setShowStartModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Engineering Objective</label>
              <textarea
                required
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                placeholder="e.g. Implement idempotency check for Stripe webhooks with tests"
                className="w-full h-28 bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Execution Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRunMode('guided')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    runMode === 'guided'
                      ? 'bg-blue-600/10 border-blue-500 text-white font-medium'
                      : 'bg-white/[0.02] border-white/5 text-slate-400'
                  }`}
                >
                  <span className="block font-bold text-blue-400">Guided (HITL)</span>
                  <span className="text-[11px] text-slate-500">Stops for approval at each step</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRunMode('auto')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    runMode === 'auto'
                      ? 'bg-blue-600/10 border-blue-500 text-white font-medium'
                      : 'bg-white/[0.02] border-white/5 text-slate-400'
                  }`}
                >
                  <span className="block font-bold text-emerald-400">Autonomous</span>
                  <span className="text-[11px] text-slate-500">Auto-runs without human stops</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowStartModal(false)}
                className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Launch Pipeline
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
