import type { BudgetState, BudgetTracker, Result, SessionState } from './types.js';
import { AppError, ok, fail } from './errors.js';

export function createBudgetTracker(): BudgetTracker {
  return {
    addUsage(state: SessionState, usd: number, tokens: number): SessionState {
      return {
        ...state,
        budget: {
          ...state.budget,
          usdSpent: state.budget.usdSpent + usd,
          tokensInPhase: state.budget.tokensInPhase + tokens,
        },
      };
    },

    checkHardStop(state: SessionState): Result<void> {
      if (state.budget.usdSpent >= state.budget.usdLimit) {
        return fail(new AppError({
          code: 'BUDGET',
          message: `Budget hard-stop: $${state.budget.usdSpent.toFixed(2)} spent of $${state.budget.usdLimit.toFixed(2)} limit`,
        }));
      }
      return ok(undefined);
    },

    shouldCompact(state: SessionState): boolean {
      return state.budget.tokensInPhase >= state.budget.tokenWarnThreshold;
    },
  };
}

export function createDefaultBudgetState(usdLimit: number = 10): BudgetState {
  return {
    usdSpent: 0,
    usdLimit,
    tokensInPhase: 0,
    tokenWarnThreshold: 64000,
  };
}
