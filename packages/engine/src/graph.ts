import type { EngineState } from './state.js';
import { planNode, rulesNode, tasksNode, pickNode, coderNode, reviewerNode } from './nodes/index.js';
import { CheckpointManager } from './checkpoint.js';
import { checkReviewerIsNotCoder, checkHardStop } from './guards.js';

const MAX_ATTEMPTS = 3;
const PASS_THRESHOLD = 9;

export class EngineGraph {
  readonly #checkpoints: CheckpointManager;

  constructor(checkpoints?: CheckpointManager) {
    this.#checkpoints = checkpoints ?? new CheckpointManager();
  }

  async run(initial: EngineState): Promise<EngineState> {
    let state = initial;

    state = await planNode(state);
    state = await rulesNode(state);
    state = await tasksNode(state);
    state = await this.#saveCheckpoint(state);

    while (true) {
      if (checkHardStop(state)) break;

      state = await pickNode(state);
      if (!state.current) break;

      state = await coderNode(state);
      state = await this.#saveCheckpoint(state);

      state = await reviewerNode(state);

      if (!checkReviewerIsNotCoder(state)) {
        state = { ...state, reviewScore: 0 };
      }

      const score = state.reviewScore ?? 0;
      const attempts = state.attempts + 1;
      state = { ...state, attempts };

      if (score >= PASS_THRESHOLD || attempts >= MAX_ATTEMPTS) break;

      const pending = state.tasks.find(t => t.status === 'pending');
      if (!pending) break;
    }

    return state;
  }

  async resume(state: EngineState): Promise<EngineState> {
    return this.run(state);
  }

  async #saveCheckpoint(state: EngineState): Promise<EngineState> {
    await this.#checkpoints.save(state);
    return state;
  }
}
