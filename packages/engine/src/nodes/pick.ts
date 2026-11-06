import { ValidationError } from '@x/core';
import type { EngineState, TaskItem } from '../state.js';
import { parsePlannedTasks } from '../generation-contract.js';

export async function pickNode(state: EngineState): Promise<EngineState> {
  const pending = state.tasks.filter(task => task.status === 'pending');
  if (pending.length === 0) return { ...state, current: undefined };
  const planned = parsePlannedTasks(state.plan?.tasks);
  const byId = new Map(planned.map(task => [task.id, task]));
  if (pending.some(task => !byId.has(task.id))) {
    throw new ValidationError('Pending task ID is missing from the structured plan');
  }
  const completed = new Set(state.tasks.filter(task => task.status === 'done').map(task => task.id));
  const ready = pending.find(task => byId.get(task.id)!.dependencies.every(id => completed.has(id)));
  if (!ready) throw new ValidationError('Pending tasks are blocked by incomplete or failed dependencies');

  const current: TaskItem = { ...ready, status: 'in-progress', assignedRole: 'coder' };
  const tasks = state.tasks.map(task => task.id === ready.id ? current : task);

  return { ...state, tasks, current };
}
