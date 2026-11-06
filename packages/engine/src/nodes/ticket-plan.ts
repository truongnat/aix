import { ValidationError } from '@x/core';
import type { EngineState, TicketPlan } from '../state.js';
import { parsePlannedTasks } from '../generation-contract.js';

export async function ticketPlanNode(state: EngineState): Promise<EngineState> {
  if (!state.current) return state;

  const task = parsePlannedTasks(state.plan?.tasks).find(task => task.id === state.current!.id);
  if (!task) throw new ValidationError('Current task ID is missing from the structured plan');
  const plan: TicketPlan = {
    ticketId: `ticket-${task.id}`,
    description: task.description,
    dependencies: task.dependencies,
    files: task.files,
    acceptanceCriteria: task.acceptanceCriteria,
  };

  const plans = [...(state.ticketPlans ?? []).filter(ticket => ticket.ticketId !== plan.ticketId), plan];

  return { ...state, ticketPlans: plans };
}
