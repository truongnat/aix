import type { PHASES, PROVIDERS, ROLES, SKILL_KINDS } from './constants.js';

export type Phase = (typeof PHASES)[number];

export type Provider = (typeof PROVIDERS)[number];

export type SkillKind = (typeof SKILL_KINDS)[number];

export type Role = (typeof ROLES)[number];

export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly cause: unknown | undefined;
  readonly path: string | undefined;
}

export interface SessionState {
  readonly id: string;
  readonly task: string;
  readonly mode: 'guardrail' | 'autonomous';
  readonly phase: Phase;
  readonly createdAt: string;
  readonly evidence: readonly EvidenceEntry[];
  readonly budget: BudgetState;
}

export interface EvidenceEntry {
  readonly phase: Phase;
  readonly kind: 'note' | 'artifact' | 'decision' | 'eval';
  readonly summary: string;
  readonly ref?: string;
  readonly at: string;
}

export interface PhaseTransition {
  readonly from: Phase;
  readonly to: Phase;
  readonly reason: string;
}

export interface PhaseGuard {
  readonly id: string;
  check(state: SessionState): Promise<Result<void>>;
}

export interface BudgetState {
  readonly usdSpent: number;
  readonly usdLimit: number;
  readonly tokensInPhase: number;
  readonly tokenWarnThreshold: number;
  readonly tokenContextLimit: number;
  readonly usdWarnThreshold: number;
}

export interface BudgetWarning {
  readonly code: 'CONTEXT_HIGH' | 'BUDGET_HIGH' | 'CONTEXT_CRITICAL' | 'BUDGET_CRITICAL';
  readonly message: string;
  readonly recoverable: boolean;
}

export interface BudgetTracker {
  addUsage(state: SessionState, usd: number, tokens: number): SessionState;
  checkHardStop(state: SessionState): Result<void>;
  checkBeforeCall(state: SessionState): { ok: true } | { ok: false; warnings: BudgetWarning[] };
  shouldCompact(state: SessionState): boolean;
}

export interface SystemPromptParts {
  readonly base: string;
  readonly responseContract: string;
  readonly toneFormat: string;
}
