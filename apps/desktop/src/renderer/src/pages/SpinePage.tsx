import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  ThumbsUp,
  RotateCcw,
  XCircle,
  FileCode2,
} from 'lucide-react';
import type { DesktopSessionSummary } from '@shared/api';

interface SpinePageProps {
  sessions: readonly DesktopSessionSummary[];
}

const SPINE_STEPS = [
  { id: 'discuss', label: '1. Discuss', desc: 'Align on success & trade-offs', artifact: 'DISCUSSION.md' },
  { id: 'plan', label: '2. Plan', desc: 'Break down verifiable tasks', artifact: 'PLAN.md' },
  { id: 'worktree', label: '3. Worktree', desc: 'Clean baseline & branch isolation', artifact: null },
  { id: 'tdd', label: '4. TDD', desc: 'Write failing test first (RED)', artifact: null },
  { id: 'execute', label: '5. Execute', desc: 'Minimal code to pass (GREEN)', artifact: null },
  { id: 'review', label: '6. Review', desc: 'Security & quality audit', artifact: 'REVIEW.md' },
  { id: 'verify', label: '7. Verify', desc: 'Concrete evidence validation', artifact: 'VERIFY.md' },
  { id: 'remember', label: '8. Remember', desc: 'Durable lessons & memory', artifact: 'REMEMBER.md' },
];

export const SpinePage: React.FC<SpinePageProps> = ({ sessions }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id ?? '');
  const [activeArtifact, setActiveArtifact] = useState<string>('PLAN.md');
  const [artifactContent, setArtifactContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [approvalNote, setApprovalNote] = useState<string>('');
  const [gateStatus, setGateStatus] = useState<string | null>(null);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0]?.id ?? '');
    }
  }, [sessions]);

  useEffect(() => {
    if (!selectedSessionId || !activeArtifact) return;
    setLoadingContent(true);
    window.aixAPI
      .getSessionArtifact(selectedSessionId, activeArtifact)
      .then((content) => {
        setArtifactContent(content ?? `No ${activeArtifact} found in session ${selectedSessionId}.`);
      })
      .catch((err) => {
        setArtifactContent(`Error loading artifact: ${String(err)}`);
      })
      .finally(() => setLoadingContent(false));
  }, [selectedSessionId, activeArtifact]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const handleGateAction = (action: 'approved' | 'revise' | 'cancelled') => {
    setGateStatus(action);
    setTimeout(() => setGateStatus(null), 3000);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Session Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Engineering Spine Controller</h1>
          <p className="text-sm text-slate-400 mt-1">
            Governing the 8-step engineering methodology, artifact generation, and human approval gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Session:</label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0f111a] text-white">
                {s.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 8-Step Interactive Stepper */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">The 8-Step Spine Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {SPINE_STEPS.map((step) => {
            const hasArtifact = step.artifact && selectedSession?.artifacts.includes(step.artifact);
            const isCurrent = step.artifact === activeArtifact;

            return (
              <div
                key={step.id}
                onClick={() => step.artifact && setActiveArtifact(step.artifact)}
                className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                  step.artifact ? 'cursor-pointer' : 'opacity-70'
                } ${
                  isCurrent
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-sm'
                    : hasArtifact
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-white/[0.01] border-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{step.label}</span>
                    {hasArtifact ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{step.desc}</p>
                </div>

                {step.artifact && (
                  <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    {step.artifact}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
              <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {artifactContent}
              </pre>
            )}
          </div>
        </div>

        {/* Human-In-The-Loop Approval Box */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Human-In-The-Loop (HITL) Gate
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review generated artifacts before advancing to execution. Enforces strict fail-closed security.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Revision Notes (optional):
              </label>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Specify changes needed before approval..."
                className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none font-sans"
              />
            </div>

            {gateStatus && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium text-center">
                Action recorded: {gateStatus.toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-4 border-t border-white/5">
            <button
              onClick={() => handleGateAction('approved')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-lg shadow-emerald-600/20"
            >
              <ThumbsUp className="w-3.5 h-3.5" /> Approve & Advance Phase
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleGateAction('revise')}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-medium text-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Request Revise
              </button>
              <button
                onClick={() => handleGateAction('cancelled')}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium text-xs transition-all"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Run
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
