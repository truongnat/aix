import type React from 'react';
import {
  MessageSquare,
  FileSpreadsheet,
  GitBranch,
  FlaskConical,
  Code2,
  ShieldCheck,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import type { Phase } from '@x/core';

export interface SpineStepInfo {
  readonly id: Phase | 'worktree' | 'tdd';
  readonly name: string;
  readonly role: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly artifact: string | null;
}

/** Shared 8-step pipeline metadata used by the chat canvas step tracker. */
export const PIPELINE_STEPS: readonly SpineStepInfo[] = [
  { id: 'discuss', name: 'Discuss', role: 'Architect', icon: MessageSquare, artifact: 'DISCUSSION.md' },
  { id: 'plan', name: 'Plan', role: 'Tasks Checklist', icon: FileSpreadsheet, artifact: 'PLAN.md' },
  { id: 'worktree', name: 'Worktree', role: 'Not executed', icon: GitBranch, artifact: null },
  { id: 'tdd', name: 'TDD', role: 'Not executed', icon: FlaskConical, artifact: null },
  { id: 'run', name: 'Code', role: 'Code generation', icon: Code2, artifact: null },
  { id: 'run', name: 'Review', role: 'Text-quality heuristic', icon: ShieldCheck, artifact: 'REVIEW.md' },
  { id: 'verify', name: 'Verify', role: 'Manual test command', icon: CheckCircle2, artifact: 'VERIFY.md' },
  { id: 'remember', name: 'Remember', role: 'Manual memory entry', icon: Brain, artifact: 'REMEMBER.md' },
];
