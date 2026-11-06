import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, realpath, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { SessionStore, createInitialEngineState } from '../../engine/dist/index.js';
import { createDefaultBudgetState } from '../../core/dist/index.js';

const cli = fileURLToPath(new URL('../dist/index.js', import.meta.url));
test('actual CLI verify and recheck preserve operational references in an email-shaped checkout', async t => {
  const root = await mkdtemp(join(tmpdir(), 'aix-checkout-reference-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const cwd = join(root, 'alice@example.com', 'project');
  const id = 'reference-verification';
  const sessions = join(cwd, '.aix', 'sessions');
  const generated = join(sessions, id, 'generated');
  const output = join(generated, '127.0.0.1', 'solution.mjs');
  await mkdir(join(generated, '127.0.0.1'), { recursive: true });
  await writeFile(output, 'export const answer = 42;\n');
  await writeFile(join(generated, 'check.mjs'), "import assert from 'node:assert/strict';\nimport { answer } from './127.0.0.1/solution.mjs';\nassert.equal(answer, 42);\nconsole.log('checked real output');\n");
  const initial = createInitialEngineState({ id, task: 'implement answer', mode: 'autonomous', phase: 'run', createdAt: '2026-11-05T00:00:00.000Z', evidence: [], budget: createDefaultBudgetState(10) });
  const store = new SessionStore(sessions);
  await store.save({ ...initial, tasks: [{ id: 'task-1', description: 'implement answer', status: 'done' }], writtenFiles: [output] });
  const run = () => spawnSync(process.execPath, [cli, 'verify', id, '--command', `${JSON.stringify(process.execPath)} check.mjs`], { cwd, encoding: 'utf8', timeout: 15000 });
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = run();
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const saved = JSON.parse(await readFile(join(sessions, id, 'state.json'), 'utf8'));
    assert.equal(saved.verification.status, 'passed');
    assert.equal(saved.verification.cwd, await realpath(generated));
    assert.deepEqual(saved.writtenFiles, [output]);
    assert.ok(saved.verification.files['127.0.0.1/solution.mjs']);
    assert.equal(saved.session.evidence.find(entry => entry.phase === 'verify').ref, await realpath(join(sessions, id, 'VERIFY.md')));
    await readFile(saved.session.evidence.find(entry => entry.phase === 'verify').ref);
  }
});
