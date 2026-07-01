import type { PhaseGuard, Result, SessionState } from './types.js';
import { AppError, fail, ok } from './errors.js';

function createEvidenceGuard(): PhaseGuard {
  return {
    id: 'evidence-guard',
    async check(state: SessionState): Promise<Result<void>> {
      if (state.phase === 'start') return ok(undefined);
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

function createDiscussArtifactGuard(): PhaseGuard {
  return {
    id: 'discuss-artifact-guard',
    async check(state: SessionState): Promise<Result<void>> {
      if (state.phase === 'discuss') {
        const hasDiscuss = state.evidence.some(
          e => e.phase === 'discuss' && e.kind === 'artifact' && e.ref?.includes('DISCUSSION.md')
        );
        if (!hasDiscuss) {
          return fail(new AppError({
            code: 'GUARD_DISCUSS_MISSING',
            message: 'Missing DISCUSSION.md artifact before advancing from discuss phase',
          }));
        }
      }
      return ok(undefined);
    },
  };
}

function createPlanArtifactGuard(): PhaseGuard {
  return {
    id: 'plan-artifact-guard',
    async check(state: SessionState): Promise<Result<void>> {
      if (state.phase === 'plan') {
        const hasPlan = state.evidence.some(
          e => e.phase === 'plan' && e.kind === 'artifact' && e.ref?.includes('PLAN.md')
        );
        if (!hasPlan) {
          return fail(new AppError({
            code: 'GUARD_PLAN_MISSING',
            message: 'Missing PLAN.md artifact before advancing from plan phase',
          }));
        }
      }
      return ok(undefined);
    },
  };
}

function createReviewArtifactGuard(): PhaseGuard {
  return {
    id: 'review-artifact-guard',
    async check(state: SessionState): Promise<Result<void>> {
      if (state.phase === 'run') {
        const hasReview = state.evidence.some(
          e => e.phase === 'run' && e.kind === 'artifact' && e.ref?.includes('REVIEW.md')
        );
        if (!hasReview) {
          return fail(new AppError({
            code: 'GUARD_REVIEW_MISSING',
            message: 'Missing REVIEW.md artifact before advancing from run phase',
          }));
        }
      }
      return ok(undefined);
    },
  };
}

function createVerifyArtifactGuard(): PhaseGuard {
  return {
    id: 'verify-artifact-guard',
    async check(state: SessionState): Promise<Result<void>> {
      if (state.phase === 'verify') {
        const hasVerify = state.evidence.some(
          e => e.phase === 'verify' && e.kind === 'artifact' && e.ref?.includes('VERIFY.md')
        );
        if (!hasVerify) {
          return fail(new AppError({
            code: 'GUARD_VERIFY_MISSING',
            message: 'Missing VERIFY.md artifact before advancing from verify phase',
          }));
        }
      }
      return ok(undefined);
    },
  };
}

function createRememberArtifactGuard(): PhaseGuard {
  return {
    id: 'remember-artifact-guard',
    async check(state: SessionState): Promise<Result<void>> {
      if (state.phase === 'remember') {
        const hasRemember = state.evidence.some(
          e => e.phase === 'remember' && e.kind === 'artifact' && e.ref?.includes('REMEMBER.md')
        );
        if (!hasRemember) {
          return fail(new AppError({
            code: 'GUARD_REMEMBER_MISSING',
            message: 'Missing REMEMBER.md artifact before advancing from remember phase',
          }));
        }
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
    createDiscussArtifactGuard(),
    createPlanArtifactGuard(),
    createReviewArtifactGuard(),
    createVerifyArtifactGuard(),
    createRememberArtifactGuard(),
  ];
}
