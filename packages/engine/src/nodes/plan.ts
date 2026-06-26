import type { EngineState, PlanDoc } from '../state.js';

export async function planNode(state: EngineState): Promise<EngineState> {
  const task = state.session.task;
  const goal = task;
  const steps = task
    .split(/[.!\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.length > 80 ? s.slice(0, 80) + '...' : s);

  const plan: PlanDoc = {
    goal,
    steps: steps.length > 0 ? steps : [task],
  };

  return { ...state, plan };
}
