import type { PhaseGuard, Result, SessionState } from './types.js';
import { AppError, fail, ok } from './errors.js';

function createEvidenceGuard(): PhaseGuard {
  return {
    id: 'evidence-guard',
    async check(state: SessionState): Promise<Result<void>> {
      const phaseEvidence = state.evidence.filter(e => e.phase === state.phase);
      if (phaseEvidence.length < 1) {
        return fail(new AppError({
          code: 'GUARD',
          message: `Phase "${state.phase}" requires at least 1 evidence entry before advancing`,
        }));
      }
      return ok(undefined);
    },
  };
}

function createShipNeedsVerifyGuard(): PhaseGuard {
  return {
    id: 'ship-needs-verify',
    async check(state: SessionState): Promise<Result<void>> {
      if (state.phase === 'ship') {
        const verifyEvidence = state.evidence.filter(e => e.phase === 'verify');
        if (verifyEvidence.length < 1) {
          return fail(new AppError({
            code: 'GUARD',
            message: 'Cannot advance to "ship" phase unless verify phase has evidence',
          }));
        }
      }
      return ok(undefined);
    },
  };
}

function createStartHasTaskGuard(): PhaseGuard {
  return {
    id: 'start-has-task',
    async check(state: SessionState): Promise<Result<void>> {
      if (state.phase === 'start' && state.task.trim().length === 0) {
        return fail(new AppError({
          code: 'GUARD',
          message: 'Start phase requires a non-empty task string',
        }));
      }
      return ok(undefined);
    },
  };
}

export function createDefaultGuards(): PhaseGuard[] {
  return [
    createEvidenceGuard(),
    createShipNeedsVerifyGuard(),
    createStartHasTaskGuard(),
  ];
}
