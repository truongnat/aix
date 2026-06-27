import { scoreOutput } from '@x/evals';
import type { EngineState } from '../state.js';

export async function reviewerNode(state: EngineState): Promise<EngineState> {
  if (!state.current?.output) {
    return { ...state, reviewScore: 0 };
  }

  const output = state.current.output;
  const description = state.current.description;

  try {
    const scores = scoreOutput(output, description);
    const values = scores.map(s => (s.score / s.max) * 10);
    const avg = values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
    const reviewScore = Math.round(avg * 10) / 10;
    return { ...state, reviewScore };
  } catch {
    return { ...state, reviewScore: 5 };
  }
}
