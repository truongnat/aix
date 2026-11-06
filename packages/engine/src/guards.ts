import { checkShell } from '@x/policy';
import type { HitlChannel } from '@x/hitl';
import type { EngineState, TicketPlan } from './state.js';


export function checkReviewerIsNotCoder(state: EngineState): boolean {
  if (!state.current?.assignedRole) return true;
  return state.current.assignedRole !== 'reviewer';
}

export function checkHardStop(state: EngineState): boolean {
  const budget = state.session.budget;
  return budget.usdSpent >= budget.usdLimit;
}

export function checkShellDenylist(command: string): boolean {
  const result = checkShell(command);
  return result.ok;
}

export function checkPlanShellDenylist(plans: readonly TicketPlan[] | undefined): boolean {
  if (!plans) return true;
  for (const plan of plans) {
    for (const cmd of plan.files) {
      if (!checkShell(cmd).ok) return false;
    }
  }
  return true;
}

export async function shouldInterrupt(phase: string, state: EngineState, hitl: HitlChannel): Promise<boolean> {
  if (state.session.mode === 'autonomous') return false;

  const interruptPhases = ['discuss', 'plan', 'ticket-plan', 'coder'];
  if (!interruptPhases.includes(phase)) return false;
  const planned = state.plan?.tasks.find(task => task.id === state.current?.id);

  const response = await hitl.ask({
    question: planned ? `Approve implementation: ${planned.title}?` : `Proceed with ${phase}?`,
    tier: 0,
    options: [
      { id: 'proceed', label: 'Proceed', summary: planned ? `Generate ${planned.files.join(', ')}` : `Continue with ${phase}` },
      { id: 'cancel', label: 'Cancel', summary: 'Stop execution' },
    ],
  });

  return response.chosen !== 'proceed';
}
