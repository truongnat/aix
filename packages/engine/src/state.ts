import type { SessionState } from '@x/core';

export interface PlanDoc {
  readonly goal: string;
  readonly steps: readonly string[];
}

export interface TaskItem {
  readonly id: string;
  readonly description: string;
  readonly status: 'pending' | 'in-progress' | 'done' | 'failed';
  readonly assignedRole?: string;
  readonly output?: string;
}

export interface EngineState {
  readonly session: SessionState;
  readonly plan?: PlanDoc;
  readonly rules?: readonly string[];
  readonly tasks: readonly TaskItem[];
  readonly current?: TaskItem;
  readonly reviewScore?: number;
  readonly attempts: number;
}

export function createInitialEngineState(session: SessionState): EngineState {
  return {
    session,
    tasks: [],
    attempts: 0,
  };
}
