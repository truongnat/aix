import React from 'react';
import {
  MessageSquare,
  FileSpreadsheet,
  GitBranch,
  FlaskConical,
  Code2,
  ShieldCheck,
  CheckCircle2,
  Brain,
  Check,
  Loader2,
} from 'lucide-react';
import type { Phase } from '@x/core';

export interface SpineStepInfo {
  readonly id: Phase | 'worktree' | 'tdd';
  readonly name: string;
  readonly role: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly artifact: string | null;
}

export const PIPELINE_STEPS: readonly SpineStepInfo[] = [
  { id: 'discuss', name: 'Discuss', role: 'Architect', icon: MessageSquare, artifact: 'DISCUSSION.md' },
  { id: 'plan', name: 'Plan', role: 'Tasks Checklist', icon: FileSpreadsheet, artifact: 'PLAN.md' },
  { id: 'worktree', name: 'Worktree', role: 'Git Guard', icon: GitBranch, artifact: null },
  { id: 'tdd', name: 'TDD', role: 'Test First RED', icon: FlaskConical, artifact: null },
  { id: 'run', name: 'Code', role: 'GREEN Implementation', icon: Code2, artifact: null },
  { id: 'run', name: 'Review', role: 'Security Audit', icon: ShieldCheck, artifact: 'REVIEW.md' },
  { id: 'verify', name: 'Verify', role: 'Sandbox Execution', icon: CheckCircle2, artifact: 'VERIFY.md' },
  { id: 'remember', name: 'Remember', role: 'Durable Memory', icon: Brain, artifact: 'REMEMBER.md' },
];

interface SpinePipelineVisualizerProps {
  currentPhase: Phase | null;
  activeArtifact: string;
  availableArtifacts: readonly string[];
  onSelectArtifact: (artifact: string) => void;
}

export const SpinePipelineVisualizer: React.FC<SpinePipelineVisualizerProps> = ({
  currentPhase,
  activeArtifact,
  availableArtifacts,
  onSelectArtifact,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
            The 8-Step Engineering Spine
          </span>
          <span className="text-[11px] text-slate-500">
            Sequential methodology pipeline. Artifacts are generated and validated at each gate.
          </span>
        </div>
        {currentPhase && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Executing: {currentPhase.toUpperCase()}
          </span>
        )}
      </div>

      {/* Visual Pipeline Flow */}
      <div className="relative flex items-center justify-between gap-1 overflow-x-auto py-2">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const hasArtifact = step.artifact && availableArtifacts.includes(step.artifact);
          const isLive = currentPhase === step.id;
          const isSelected = step.artifact === activeArtifact;

          return (
            <React.Fragment key={`${step.id}-${idx}`}>
              {/* Step Node */}
              <button
                type="button"
                onClick={() => step.artifact && onSelectArtifact(step.artifact)}
                disabled={!step.artifact}
                className={`relative flex flex-col items-center text-center p-3 rounded-xl transition-all min-w-[90px] group ${
                  step.artifact ? 'cursor-pointer' : 'cursor-default opacity-60'
                } ${
                  isLive
                    ? 'bg-blue-600/20 border border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                    : isSelected
                    ? 'bg-blue-600/10 border border-blue-500/40'
                    : hasArtifact
                    ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-white/[0.02] hover:bg-white/[0.04] border border-white/5'
                }`}
              >
                {/* Status Dot / Icon Container */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${
                    isLive
                      ? 'bg-blue-600 text-white animate-pulse'
                      : hasArtifact
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/5'
                  }`}
                >
                  {isLive ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : hasArtifact ? (
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Labels */}
                <span className="font-bold text-xs text-white tracking-tight">{step.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{step.role}</span>

                {/* Artifact Pill */}
                {step.artifact && (
                  <span
                    className={`mt-2 text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      hasArtifact
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-white/5 text-slate-500 border-white/5'
                    }`}
                  >
                    {step.artifact.replace('.md', '')}
                  </span>
                )}
              </button>

              {/* Connecting Line */}
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className="hidden md:block flex-1 h-[2px] mx-1 bg-white/5 relative overflow-hidden">
                  {hasArtifact && <div className="absolute inset-0 bg-emerald-500/40" />}
                  {isLive && <div className="absolute inset-0 bg-blue-500 animate-pulse" />}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
