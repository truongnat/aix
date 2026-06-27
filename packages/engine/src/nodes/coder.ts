import type { EngineState, TaskItem } from '../state.js';
import { createProvider, type RuntimeProvider } from '@x/providers';

export async function coderNode(state: EngineState): Promise<EngineState> {
  if (!state.current) return state;

  const provider: RuntimeProvider = createProvider();
  const system = buildSystemPrompt(state);
  const user = buildUserPrompt(state.current, state);
  const response = await provider.call({ system, user });

  const output = response.content;
  const tasks = state.tasks.map(t =>
    t.id === state.current!.id
      ? { ...t, status: 'done' as const, output, assignedRole: 'coder' as const }
      : t
  );

  return {
    ...state,
    tasks,
    current: { ...state.current, status: 'done' as const, output, assignedRole: 'coder' as const },
    coderOutput: output,
  };
}

function buildSystemPrompt(state: EngineState): string {
  const rules = state.rules?.length
    ? state.rules.join('\n')
    : 'Follow TypeScript best practices. Write clean, idiomatic code.';
  return `You are an expert TypeScript engineer implementing a solution.

Rules:
${rules}

Generate production-ready code. Include exports, types, and documentation.`;
}

function buildUserPrompt(current: TaskItem, state: EngineState): string {
  const parts: string[] = [`Task: ${current.description}`];

  if (state.plan?.goal) {
    parts.push(`\nGoal: ${state.plan.goal}`);
  }

  const ticket = state.ticketPlans?.find(t => t.description === current.description);
  if (ticket) {
    parts.push(`\nFiles to modify:\n${ticket.files.map(f => `  - ${f}`).join('\n')}`);
    parts.push(`\nAcceptance criteria:\n${ticket.acceptanceCriteria.map(c => `  - [ ] ${c}`).join('\n')}`);
  }

  return parts.join('\n');
}
