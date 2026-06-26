import type { EngineState, TaskItem } from '../state.js';

export async function tasksNode(state: EngineState): Promise<EngineState> {
  const steps = state.plan?.steps ?? [state.session.task];
  const tasks: TaskItem[] = steps.map((step, i) => ({
    id: `task-${i + 1}`,
    description: step,
    status: 'pending' as const,
  }));

  return { ...state, tasks };
}
