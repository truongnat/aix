import type { BudgetState, BudgetTracker, BudgetWarning, Result, SessionState } from './types.js';
import { AppError, ok, fail } from './errors.js';

export function createBudgetTracker(): BudgetTracker {
  return {
    addUsage(
      state: SessionState,
      usd: number,
      tokens: number,
      promptTokens?: number,
      completionTokens?: number
    ): SessionState {
      const pTokens = promptTokens ?? Math.round(tokens * 0.8);
      const cTokens = completionTokens ?? (tokens - pTokens);
      return {
        ...state,
        budget: {
          ...state.budget,
          usdSpent: state.budget.usdSpent + usd,
          tokensInPhase: state.budget.tokensInPhase + tokens,
          promptTokensInPhase: state.budget.promptTokensInPhase + pTokens,
          completionTokensInPhase: state.budget.completionTokensInPhase + cTokens,
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
      if (state.budget.tokensInPhase >= state.budget.tokenContextLimit) {
        return fail(new AppError({
          code: 'CONTEXT',
          message: `Context hard-stop: ${state.budget.tokensInPhase} tokens used of ${state.budget.tokenContextLimit} limit`,
        }));
      }
      return ok(undefined);
    },

    checkBeforeCall(state: SessionState): { ok: true } | { ok: false; warnings: BudgetWarning[] } {
      const warnings: BudgetWarning[] = [];
      const budget = state.budget;

      const usdRatio = budget.usdSpent / budget.usdLimit;
      if (usdRatio >= 1) {
        warnings.push({
          code: 'BUDGET_CRITICAL',
          message: `Budget exhausted: $${budget.usdSpent.toFixed(2)} of $${budget.usdLimit.toFixed(2)}. Cannot continue without reset.`,
          recoverable: false,
        });
      } else if (usdRatio >= budget.usdWarnThreshold) {
        warnings.push({
          code: 'BUDGET_HIGH',
          message: `Budget near limit: $${budget.usdSpent.toFixed(2)} of $${budget.usdLimit.toFixed(2)} (${(usdRatio * 100).toFixed(0)}%). Consider confirming before proceeding.`,
          recoverable: true,
        });
      }

      const ctxRatio = budget.tokensInPhase / budget.tokenContextLimit;
      if (ctxRatio >= 1) {
        warnings.push({
          code: 'CONTEXT_CRITICAL',
          message: `Context full: ${budget.tokensInPhase} of ${budget.tokenContextLimit} tokens. Must compact or clear before continuing.`,
          recoverable: false,
        });
      } else if (ctxRatio >= 0.8) {
        warnings.push({
          code: 'CONTEXT_HIGH',
          message: `Context nearly full: ${budget.tokensInPhase} of ${budget.tokenContextLimit} tokens (${(ctxRatio * 100).toFixed(0)}%). Consider compacting.`,
          recoverable: true,
        });
      }

      if (warnings.length > 0) {
        return { ok: false, warnings };
      }
      return { ok: true };
    },

    shouldCompact(state: SessionState): boolean {
      const ratio = state.budget.tokensInPhase / state.budget.tokenContextLimit;
      return ratio >= 0.8;
    },
  };
}

export function createDefaultBudgetState(usdLimit: number = 10): BudgetState {
  return {
    usdSpent: 0,
    usdLimit,
    tokensInPhase: 0,
    promptTokensInPhase: 0,
    completionTokensInPhase: 0,
    tokenWarnThreshold: 64000,
    tokenContextLimit: 200000,
    usdWarnThreshold: 0.8,
  };
}
