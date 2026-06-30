import { createBudgetTracker, type BudgetWarning } from '@x/core';
import type { EngineState } from './state.js';

export type BudgetCheckResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly warnings: readonly BudgetWarning[] };

export function checkBudget(state: EngineState): BudgetCheckResult {
  const tracker = createBudgetTracker();
  return tracker.checkBeforeCall(state.session);
}

export function formatBudgetWarnings(warnings: readonly BudgetWarning[]): string {
  return warnings.map(w => {
    const icon = w.recoverable ? '⚠' : '✖';
    return `  ${icon} [${w.code}] ${w.message}`;
  }).join('\n');
}
