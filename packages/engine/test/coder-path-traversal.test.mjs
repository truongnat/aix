import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createDefaultBudgetState } from '@x/core';
import { createInitialEngineState, coderNode, sessionGeneratedDir } from '@x/engine';

function providerResponse(t, content) {
  const names = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GROQ_API_KEY', 'AIX_PROVIDER'];
  const before = Object.fromEntries(names.map(name => [name, process.env[name]]));
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GROQ_API_KEY;
  process.env.OPENAI_API_KEY = 'test-only-not-a-real-key';
  process.env.AIX_PROVIDER = 'openai';
  t.after(() => { for (const name of names) { if (before[name] === undefined) delete process.env[name]; else process.env[name] = before[name]; } });
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 10, completion_tokens: 20 } }), { status: 200 }));
}

for (const [label, file] of [['nested dot traversal', '....//....//....//etc/x'], ['absolute path', '/etc/passwd']]) {
  test(`coder rejects ${label} target with ValidationError and writes nothing outside the sandbox`, async t => {
    const id = `traversal-${process.pid}-${Date.now()}`;
    const root = sessionGeneratedDir(id);
    const escaped = resolve(root, file.replace(/\.\.\.\.\/\//g, '../'));
    t.after(async () => {
      await rm(join(root, '..'), { recursive: true, force: true });
      if (!file.startsWith('/')) await rm(escaped, { force: true });
    });
    providerResponse(t, 'export const x = 1;\n');
    const current = { id: 'task-1', description: 'write file', status: 'pending' };
    const state = { ...createInitialEngineState({ id, task: 'write', mode: 'autonomous', phase: 'run', createdAt: '2026-11-05T00:00:00.000Z', evidence: [], budget: createDefaultBudgetState(10) }), current, tasks: [current], ticketPlans: [{ ticketId: 't1', description: 'write file', files: [file], acceptanceCriteria: [] }] };
    await assert.rejects(coderNode(state), error => {
      assert.equal(error.name, 'ValidationError');
      return true;
    });
    if (!file.startsWith('/')) assert.equal(existsSync(escaped), false);
    assert.equal(existsSync(root), false);
  });
}
