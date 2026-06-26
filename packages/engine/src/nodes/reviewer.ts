import { scoreOutput } from '@x/evals';
import type { EngineState } from '../state.js';

export async function reviewerNode(state: EngineState): Promise<EngineState> {
  if (!state.current?.output) {
    return { ...state, reviewScore: 0 };
  }

  try {
    const scores = scoreOutput(state.current.output);
    const values = scores.map(s => s.score);
    const avg = values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 5;
    const reviewScore = Math.round(avg * 10) / 10;
    return { ...state, reviewScore };
  } catch {
    return { ...state, reviewScore: 5 };
  }
}
