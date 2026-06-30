import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { createBudgetTracker } from '@x/core';
import type { EngineState, TaskItem } from '../state.js';
import { createProvider, type RuntimeProvider } from '@x/providers';

const GENERATED_ROOT = '.aix/runtime/generated';

export async function coderNode(state: EngineState): Promise<EngineState> {
  if (!state.current) return state;

  const provider: RuntimeProvider = createProvider();
  const system = buildSystemPrompt(state);
  const user = buildUserPrompt(state.current, state);
  const response = await provider.call({ system, user });

  const output = response.content;

  // T2: feed real provider usage back into the session budget so the
  // hard-stop guard (checkHardStop) sees actual spend, not a frozen 0.
  const tracker = createBudgetTracker();
  const session = tracker.addUsage(state.session, response.usd, response.tokens);

  // T1: write generated code to a sandbox dir. The autonomous loop has no
  // human review, so we never clobber the user's source — output lands under
  // .aix/runtime/generated/<sessionId>/ for the user to inspect and apply.
  const target = resolveTarget(state.current, state);
  const written = await writeOutput(session.id, target, output);

  const tasks = state.tasks.map(t =>
    t.id === state.current!.id
      ? { ...t, status: 'done' as const, output, assignedRole: 'coder' as const }
      : t
  );

  return {
    ...state,
    session,
    tasks,
    current: { ...state.current, status: 'done' as const, output, assignedRole: 'coder' as const },
    coderOutput: output,
    writtenFiles: written, // only the new file(s); graph reducer accumulates
  };
}

function resolveTarget(current: TaskItem, state: EngineState): string {
  const ticket = state.ticketPlans?.find(t => t.description === current.description);
  return ticket?.files[0] ?? `task-${current.id}.ts`;
}

async function writeOutput(
  sessionId: string,
  relPath: string,
  content: string,
): Promise<string[]> {
  // Strip leading ../ and absolute prefixes plus any embedded ../ segments to
  // prevent path traversal out of the sandbox; the result is always confined
  // to .aix/runtime/generated/<sessionId>/.
  const safe = relPath
    .replace(/^(\.\.[/\\])+/, '')
    .replace(/^[/\\]+/, '')
    .replace(/\.\.[/\\]/g, '');
  const dest = join(GENERATED_ROOT, sessionId, safe);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, content, 'utf-8');
  return [dest.replace(/\\/g, '/')];
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
