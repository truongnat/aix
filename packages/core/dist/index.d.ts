declare const PHASES: readonly ["start", "discuss", "plan", "run", "verify", "ship", "remember"];
declare const SKILL_KINDS: readonly ["domain", "process", "reference"];
declare const PROVIDERS: readonly ["claude", "cursor", "codex", "gemini"];
declare const ROLES: readonly ["planner", "coder", "reviewer", "architect"];
declare const SKILL_BODY_MAX_TOKENS = 5000;
declare const SKILL_NAME_MAX = 64;
declare const SKILL_DESC_MAX = 1024;
declare const SCOPE = "@x";

type Phase = (typeof PHASES)[number];
type Provider = (typeof PROVIDERS)[number];
type SkillKind = (typeof SKILL_KINDS)[number];
type Role = (typeof ROLES)[number];
type Result<T, E = AppError$1> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
type AppErrorCode = 'VALIDATION' | 'BUDGET' | 'CONTEXT' | 'PHASE' | 'GUARD' | 'GUARD_DISCUSS_MISSING' | 'GUARD_PLAN_MISSING' | 'GUARD_REVIEW_MISSING' | 'GUARD_VERIFY_MISSING' | 'GUARD_REMEMBER_MISSING' | 'POLICY' | 'IO' | 'WARN' | 'UNEXPECTED';
interface AppError$1 {
    readonly code: AppErrorCode;
    readonly message: string;
    readonly cause: unknown | undefined;
    readonly path: string | undefined;
}
interface SessionState {
    readonly id: string;
    readonly task: string;
    readonly mode: 'guardrail' | 'autonomous';
    readonly phase: Phase;
    readonly createdAt: string;
    readonly evidence: readonly EvidenceEntry[];
    readonly budget: BudgetState;
}
interface EvidenceEntry {
    readonly phase: Phase;
    readonly kind: 'note' | 'artifact' | 'decision' | 'eval';
    readonly summary: string;
    readonly ref?: string;
    readonly contentHash?: string;
    readonly at: string;
}
interface PhaseTransition {
    readonly from: Phase;
    readonly to: Phase;
    readonly reason: string;
}
interface PhaseGuard {
    readonly id: string;
    check(state: SessionState): Promise<Result<void>>;
}
interface BudgetState {
    readonly usdSpent: number;
    readonly usdLimit: number;
    readonly tokensInPhase: number;
    readonly promptTokensInPhase: number;
    readonly completionTokensInPhase: number;
    readonly tokenWarnThreshold: number;
    readonly tokenContextLimit: number;
    readonly usdWarnThreshold: number;
}
interface BudgetWarning {
    readonly code: 'CONTEXT_HIGH' | 'BUDGET_HIGH' | 'CONTEXT_CRITICAL' | 'BUDGET_CRITICAL';
    readonly message: string;
    readonly recoverable: boolean;
}
interface BudgetTracker {
    addUsage(state: SessionState, usd: number, tokens: number, promptTokens?: number, completionTokens?: number): SessionState;
    checkHardStop(state: SessionState): Result<void>;
    checkBeforeCall(state: SessionState): {
        ok: true;
    } | {
        ok: false;
        warnings: BudgetWarning[];
    };
    shouldCompact(state: SessionState): boolean;
}
interface SystemPromptParts {
    readonly base: string;
    readonly responseContract: string;
    readonly toneFormat: string;
}

declare class AppError extends Error {
    readonly code: AppErrorCode;
    readonly path: string | undefined;
    readonly cause: unknown | undefined;
    constructor(opts: {
        code: AppErrorCode;
        message: string;
        cause?: unknown;
        path?: string;
    });
}
declare class ValidationError extends AppError {
    constructor(message: string, opts?: {
        path?: string;
        cause?: unknown;
    });
}
declare function ok<T, E = AppError>(value: T): Result<T, E>;
declare function fail<T, E = AppError>(error: E): Result<T, E>;

declare class PhaseMachine {
    #private;
    constructor(guards?: readonly PhaseGuard[]);
    current(state: SessionState): Phase;
    advance(state: SessionState): Promise<Result<SessionState>>;
    rewind(state: SessionState, to: Phase, reason: string): SessionState;
    canAdvanceTo(from: Phase, to: Phase): boolean;
}

declare function createDefaultGuards(): PhaseGuard[];

declare class GuardrailLoop {
    #private;
    constructor();
    createSession(task: string): Promise<SessionState>;
    advancePhase(state: SessionState): Promise<SessionState>;
    rewindTo(state: SessionState, to: Phase, reason: string): SessionState;
    addEvidence(state: SessionState, entry: Omit<EvidenceEntry, 'at'>): SessionState;
    canAdvanceTo(from: Phase, to: Phase): boolean;
}

declare function createBudgetTracker(): BudgetTracker;
declare function createDefaultBudgetState(usdLimit?: number): BudgetState;

export { type AppError$1 as AppError, AppError as AppErrorClass, type AppErrorCode, type BudgetState, type BudgetTracker, type BudgetWarning, type EvidenceEntry, GuardrailLoop, PHASES, PROVIDERS, type Phase, type PhaseGuard, PhaseMachine, type PhaseTransition, type Provider, ROLES, type Result, type Role, SCOPE, SKILL_BODY_MAX_TOKENS, SKILL_DESC_MAX, SKILL_KINDS, SKILL_NAME_MAX, type SessionState, type SkillKind, type SystemPromptParts, ValidationError, createBudgetTracker, createDefaultBudgetState, createDefaultGuards, fail, ok };
