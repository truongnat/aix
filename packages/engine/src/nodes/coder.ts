import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { createBudgetTracker, ValidationError } from '@x/core';
import type { EngineState, TaskItem } from '../state.js';
import { createProvider, type RuntimeProvider } from '@x/providers';
import { sessionGeneratedDir } from '../session-store.js';
import { checkBudget, formatBudgetWarnings } from '../budget-guard.js';
import { redact } from '@x/policy';

export async function coderNode(state: EngineState): Promise<EngineState> {
  if (!state.current) return state;

  const provider: RuntimeProvider = createProvider();
  const system = buildSystemPrompt(state);
  const user = buildUserPrompt(state.current, state);

  const budgetCheck = checkBudget(state);
  if (!budgetCheck.ok) {
    const critical = budgetCheck.warnings.filter(w => !w.recoverable);
    if (critical.length > 0) {
      throw new Error(`Budget check failed:\n${formatBudgetWarnings(critical)}`);
    }
    console.warn(`[budget] Warnings before coder:\n${formatBudgetWarnings(budgetCheck.warnings)}`);
  }

  const response = await provider.call({ system, user });

  const output = response.content;
  if (redact(output).findings.some(finding => finding.type === 'secret')) {
    throw new Error('Generated source contains a recognized secret; no output was written');
  }

  // T2: feed real provider usage back into the session budget so the
  // hard-stop guard (checkHardStop) sees actual spend, not a frozen 0.
  const tracker = createBudgetTracker();
  const session = tracker.addUsage(state.session, response.usd, response.tokens);

  // T1: write generated code to a sandbox dir. The autonomous loop has no
  // human review, so we never clobber the user's source — output lands under
  // .aix/sessions/<sessionId>/generated/ for the user to inspect and apply.
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
  if (redact(relPath).findings.some(finding => finding.type === 'secret')) {
    throw new Error('Generated file path contains a recognized secret; no output was written');
  }
  // Resolve then verify containment: string-stripping `../` is bypassable
  // (e.g. `....//` collapses to `../`), so reject anything escaping the sandbox.
  const root = resolve(sessionGeneratedDir(sessionId));
  const dest = resolve(root, relPath);
  const rel = relative(root, dest);
  if (rel === '' || rel.startsWith('..') || isAbsolute(rel)) {
    throw new ValidationError('Generated file path escapes the session sandbox; no output was written');
  }
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
