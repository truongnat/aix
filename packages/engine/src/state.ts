import type { SessionState } from '@x/core';

export interface PlannedTask {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly dependencies: readonly string[];
  readonly files: readonly string[];
  readonly acceptanceCriteria: readonly string[];
}

export interface PlanDoc {
  readonly goal: string;
  readonly steps: readonly string[];
  readonly tasks: readonly PlannedTask[];
}

export interface ScoredOption {
  readonly name: string;
  readonly value: number;
  readonly effortFit: number;
  readonly risk: number;
  readonly fit: number;
}

export interface DiscussionDoc {
  readonly goal: string;
  readonly constraints: readonly string[];
  readonly options: readonly ScoredOption[];
  readonly recommendation: string;
  readonly rationale: string;
}

export interface TaskItem {
  readonly id: string;
  readonly description: string;
  readonly status: 'pending' | 'in-progress' | 'done' | 'failed';
  readonly assignedRole?: string;
  readonly output?: string;
}

export interface TicketPlan {
  readonly ticketId: string;
  readonly description: string;
  readonly dependencies: readonly string[];
  readonly files: readonly string[];
  readonly acceptanceCriteria: readonly string[];
}

export interface VerificationEvidence {
  readonly status: 'passed' | 'failed';
  readonly command: string;
  readonly cwd: string;
  readonly exitCode: number;
  readonly output: string;
  readonly checkedAt: string;
  readonly files: Readonly<Record<string, string>>;
}

export interface EngineState {
  readonly session: SessionState;
  readonly discussion?: DiscussionDoc;
  readonly plan?: PlanDoc;
  readonly rules?: readonly string[];
  readonly tasks: readonly TaskItem[];
  readonly current?: TaskItem | undefined;
  /** Text quality heuristic only; never evidence of executable correctness. */
  readonly reviewScore?: number;
  readonly attempts: number;
  readonly ticketPlans?: readonly TicketPlan[];
  readonly coderOutput?: string;
  readonly writtenFiles?: readonly string[];
  readonly verification?: VerificationEvidence;
}

export function createInitialEngineState(session: SessionState): EngineState {
  return {
    session,
    tasks: [],
    attempts: 0,
  };
}
