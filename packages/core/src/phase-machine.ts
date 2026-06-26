import type { Phase, PhaseGuard, Result, SessionState } from './types.js';
import { AppError, ok, fail } from './errors.js';

const PHASE_ORDER: readonly Phase[] = ['start', 'discuss', 'plan', 'run', 'verify', 'ship', 'remember'];

export class PhaseMachine {
  readonly #guards: readonly PhaseGuard[];

  constructor(guards: readonly PhaseGuard[] = []) {
    this.#guards = guards;
  }

  current(state: SessionState): Phase {
    return state.phase;
  }

  async advance(state: SessionState): Promise<Result<SessionState>> {
    for (const guard of this.#guards) {
      const result = await guard.check(state);
      if (!result.ok) return result as Result<SessionState>;
    }

    const idx = PHASE_ORDER.indexOf(state.phase);
    if (idx === -1 || idx >= PHASE_ORDER.length - 1) {
      return fail(new AppError({
        code: 'PHASE',
        message: `Cannot advance from final phase "${state.phase}"`,
      }));
    }

    return ok({
      ...state,
      phase: PHASE_ORDER[idx + 1]!,
    });
  }

  rewind(state: SessionState, to: Phase, reason: string): SessionState {
    return {
      ...state,
      phase: to,
      evidence: [
        ...state.evidence,
        {
          phase: state.phase,
          kind: 'decision',
          summary: `Rewind to "${to}": ${reason}`,
          at: new Date().toISOString(),
        },
      ],
    };
  }

  canAdvanceTo(from: Phase, to: Phase): boolean {
    const fromIdx = PHASE_ORDER.indexOf(from);
    const toIdx = PHASE_ORDER.indexOf(to);
    return fromIdx !== -1 && toIdx !== -1 && toIdx >= fromIdx;
  }
}
