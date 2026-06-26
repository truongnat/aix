import type { SessionState, Phase, EvidenceEntry } from './types.js';
import { PhaseMachine } from './phase-machine.js';
import { createDefaultGuards } from './guards.js';
import { createDefaultBudgetState } from './budget.js';

export class GuardrailLoop {
  readonly #machine: PhaseMachine;

  constructor() {
    this.#machine = new PhaseMachine(createDefaultGuards());
  }

  async createSession(task: string): Promise<SessionState> {
    return {
      id: crypto.randomUUID(),
      task,
      mode: 'guardrail',
      phase: 'start',
      createdAt: new Date().toISOString(),
      evidence: [],
      budget: createDefaultBudgetState(),
    };
  }

  async advancePhase(state: SessionState): Promise<SessionState> {
    const result = await this.#machine.advance(state);
    if (!result.ok) {
      throw result.error;
    }
    return result.value;
  }

  rewindTo(state: SessionState, to: Phase, reason: string): SessionState {
    return this.#machine.rewind(state, to, reason);
  }

  addEvidence(state: SessionState, entry: Omit<EvidenceEntry, 'at'>): SessionState {
    return {
      ...state,
      evidence: [
        ...state.evidence,
        { ...entry, at: new Date().toISOString() },
      ],
    };
  }

  canAdvanceTo(from: Phase, to: Phase): boolean {
    return this.#machine.canAdvanceTo(from, to);
  }
}
