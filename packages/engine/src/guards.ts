import { checkShell } from '@x/policy';
import type { EngineState } from './state.js';

export function checkReviewerIsNotCoder(state: EngineState): boolean {
  if (!state.current?.assignedRole) return true;
  return state.current.assignedRole !== 'reviewer';
}

export function checkHardStop(state: EngineState): boolean {
  const budget = state.session.budget;
  return budget.usdSpent >= budget.usdLimit;
}

export function checkShellDenylist(command: string): boolean {
  const result = checkShell(command);
  return result.ok;
}

export function shouldInterrupt(_phase: string, _state: EngineState): boolean {
  return false;
}
