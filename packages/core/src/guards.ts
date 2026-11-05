import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AppErrorCode, EvidenceEntry, Phase, PhaseGuard, Result, SessionState } from './types.js';
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

export interface GuardOptions {
  /** Directory relative artifact refs resolve against (default: process.cwd()). */
  readonly baseDir?: string;
  /** When true, the referenced artifact must exist on disk as a non-empty file. */
  readonly checkFileExists?: boolean;
}

function isValidArtifactEvidence(e: EvidenceEntry, fileName: string, options: GuardOptions): boolean {
  if (e.kind !== 'artifact' || typeof e.ref !== 'string') return false;
  // Exact basename match: substrings like "NOT-PLAN.md" or "PLAN.md.bak" are not the artifact.
  if (e.ref.split(/[\\/]/).pop() !== fileName) return false;
  if (!e.contentHash?.trim() && !e.summary?.trim()) return false;
  if (!options.checkFileExists) return true;
  try {
    const stat = statSync(resolve(options.baseDir ?? process.cwd(), e.ref));
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

function createArtifactGuard(id: string, phase: Phase, fileName: string, code: AppErrorCode, options: GuardOptions): PhaseGuard {
  return {
    id,
    async check(state: SessionState): Promise<Result<void>> {
      if (state.phase !== phase) return ok(undefined);
      const has = state.evidence.some(e => e.phase === phase && isValidArtifactEvidence(e, fileName, options));
      if (has) return ok(undefined);
      return fail(new AppError({
        code,
        message: `Missing ${fileName} artifact before advancing from ${phase} phase`,
      }));
    },
  };
}

export function createDefaultGuards(options: GuardOptions = {}): PhaseGuard[] {
  return [
    createEvidenceGuard(),
    createStartHasTaskGuard(),
    createArtifactGuard('discuss-artifact-guard', 'discuss', 'DISCUSSION.md', 'GUARD_DISCUSS_MISSING', options),
    createArtifactGuard('plan-artifact-guard', 'plan', 'PLAN.md', 'GUARD_PLAN_MISSING', options),
    createArtifactGuard('review-artifact-guard', 'run', 'REVIEW.md', 'GUARD_REVIEW_MISSING', options),
    createArtifactGuard('verify-artifact-guard', 'verify', 'VERIFY.md', 'GUARD_VERIFY_MISSING', options),
    createArtifactGuard('remember-artifact-guard', 'remember', 'REMEMBER.md', 'GUARD_REMEMBER_MISSING', options),
  ];
}
