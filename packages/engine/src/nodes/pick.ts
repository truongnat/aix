import type { EngineState, TaskItem } from '../state.js';

export async function pickNode(state: EngineState): Promise<EngineState> {
  const pending = state.tasks.find(t => t.status === 'pending');
  if (!pending) return state;

  const current: TaskItem = { ...pending, status: 'in-progress', assignedRole: 'coder' };
  const tasks = state.tasks.map(t =>
    t.id === pending.id ? current : t
  );

  return { ...state, tasks, current };
}
