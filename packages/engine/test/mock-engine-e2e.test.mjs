import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createDefaultBudgetState } from '@x/core';
import {
  discussNode, planNode, tasksNode, pickNode, ticketPlanNode, coderNode,
  createInitialEngineState, sessionGeneratedDir,
} from '../dist/index.js';

test('engine runs discuss -> plan -> coder using Mock provider without network calls', async t => {
  const temp = await mkdtemp(join(tmpdir(), 'aix-mock-engine-'));
  const before = { ...process.env };
  Object.assign(process.env, {
    AIX_SESSIONS_ROOT: temp,
    AIX_PROVIDER: 'mock',
  });
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GROQ_API_KEY;

  t.after(async () => {
    for (const key of ['AIX_SESSIONS_ROOT', 'AIX_PROVIDER', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GROQ_API_KEY']) {
      if (before[key] === undefined) delete process.env[key]; else process.env[key] = before[key];
    }
    await rm(temp, { recursive: true, force: true });
  });
  t.mock.method(globalThis, 'fetch', () => { throw new Error('Offline Mock must not call the network'); });

  const session = {
    id: randomUUID(),
    task: 'Create hello world app',
    mode: 'autonomous',
    phase: 'discuss',
    createdAt: new Date().toISOString(),
    evidence: [],
    budget: createDefaultBudgetState(10),
  };

  const initial = createInitialEngineState(session);

  // 1. Discuss
  const afterDiscuss = await discussNode(initial);
  assert.ok(afterDiscuss.discussion);
  assert.match(afterDiscuss.discussion.goal, /Create hello world app/i);

  // 2. Plan
  const afterPlan = await planNode(afterDiscuss);
  assert.ok(afterPlan.plan);
  assert.ok(afterPlan.plan.tasks.length > 0);
  assert.deepEqual(afterPlan.plan.tasks[0].files, ['README.md']);

  // 3. Tasks & Pick
  const afterTasks = await tasksNode(afterPlan);
  const afterPick = await pickNode(afterTasks);
  const afterTicket = await ticketPlanNode(afterPick);

  // 4. Coder
  const afterCoder = await coderNode(afterTicket);
  assert.equal(afterCoder.tasks[0].status, 'done');
  const genDir = sessionGeneratedDir(session.id);
  const content = await readFile(join(genDir, 'README.md'), 'utf8');
  assert.match(content, /Offline demo output/i);
});
