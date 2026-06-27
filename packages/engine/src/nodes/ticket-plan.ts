import type { EngineState, TicketPlan } from '../state.js';

export async function ticketPlanNode(state: EngineState): Promise<EngineState> {
  if (!state.current) return state;

  const task = state.current;
  const plan: TicketPlan = {
    ticketId: `ticket-${task.id}`,
    description: task.description,
    files: inferFiles(task.description, state.plan?.goal ?? ''),
    acceptanceCriteria: inferCriteria(task.description),
  };

  const plans = [...(state.ticketPlans ?? []), plan];

  return { ...state, ticketPlans: plans };
}

function inferFiles(description: string, goal: string): string[] {
  const combined = `${goal} ${description}`.toLowerCase();
  const candidates: string[] = [];

  if (combined.includes('api') || combined.includes('route')) {
    candidates.push('src/routes/solution.ts');
  }
  if (combined.includes('component') || combined.includes('ui') || combined.includes('react')) {
    candidates.push('src/components/Solution.tsx');
  }
  if (combined.includes('function') || combined.includes('util') || combined.includes('helper')) {
    candidates.push('src/utils/solution.ts');
  }
  if (combined.includes('config') || combined.includes('setup')) {
    candidates.push('config/solution.json');
  }
  if (combined.includes('test') || combined.includes('spec') || combined.includes('unit')) {
    candidates.push('src/__tests__/solution.test.ts');
  }
  if (combined.includes('hook') || combined.includes('use')) {
    candidates.push('src/hooks/useSolution.ts');
  }
  if (combined.includes('style') || combined.includes('css') || combined.includes('theme')) {
    candidates.push('src/styles/solution.css');
  }

  if (candidates.length === 0) {
    candidates.push('src/lib/solution.ts');
  }

  return candidates;
}

function inferCriteria(description: string): string[] {
  const base: string[] = [
    `[${description}] produces the expected output`,
    `Edge cases are handled gracefully`,
    `No regressions in existing behaviour`,
  ];

  const lower = description.toLowerCase();

  if (lower.includes('api') || lower.includes('endpoint')) {
    base.push('Returns valid HTTP status codes');
    base.push('Request validation rejects malformed input');
  }
  if (lower.includes('ui') || lower.includes('component') || lower.includes('render')) {
    base.push('Renders correctly on 320px–1920px viewports');
    base.push('All interactive states work (hover, focus, active)');
  }
  if (lower.includes('data') || lower.includes('database') || lower.includes('store')) {
    base.push('Data is persisted atomically');
    base.push('Read-after-write consistency holds');
  }

  return base;
}
