import type { EngineState, TaskItem } from '../state.js';
import { parsePlannedTasks } from '../generation-contract.js';

export async function tasksNode(state: EngineState): Promise<EngineState> {
  const planned = parsePlannedTasks(state.plan?.tasks);
  const tasks: TaskItem[] = planned.map(task => ({
    id: task.id,
    description: task.description,
    status: 'pending' as const,
  }));

  return { ...state, tasks };
}
