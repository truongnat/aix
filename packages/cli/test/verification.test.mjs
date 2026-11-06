import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, realpath, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { GuardrailLoop } from '../../core/dist/index.js';

const cli = fileURLToPath(new URL('../dist/index.js', import.meta.url));
const id = 'verification-fixture';

async function fixture(t, source = 'export const add = (a, b) => a + b;\n') {
  const cwd = await mkdtemp(join(tmpdir(), 'aix-verification-'));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  const dir = join(cwd, '.aix', 'sessions', id);
  const generated = join(dir, 'generated');
  await mkdir(generated, { recursive: true });
  const output = join(generated, 'solution.mjs');
  await writeFile(output, source);
  await writeFile(join(generated, 'check.mjs'), "import assert from 'node:assert/strict';\nimport {add} from './solution.mjs';\nassert.equal(add(2,3),5);\nconsole.log('addition checked');\n");
  const state = {
    session: { id, task: 'implement add', mode: 'autonomous', phase: 'run', createdAt: '2026-11-05T00:00:00.000Z', evidence: [], budget: { usdSpent: 0, usdLimit: 10, tokensInPhase: 0, promptTokensInPhase: 0, completionTokensInPhase: 0, tokenWarnThreshold: 64000, tokenContextLimit: 200000, usdWarnThreshold: 0.8 } },
    tasks: [{ id: 'task-1', description: 'implement add', status: 'done', output: source }], attempts: 1, writtenFiles: [output],
  };
  const statePath = join(dir, 'state.json');
  await writeFile(statePath, JSON.stringify(state));
  const run = (command = `${JSON.stringify(process.execPath)} check.mjs`) => spawnSync(process.execPath, [cli, 'verify', id, '--command', command], { cwd, encoding: 'utf8', timeout: 15000 });
  return { cwd, dir, generated, output, source, state, statePath, run };
}

test('verify executes the supplied check in the session sandbox and records output-bound evidence', async t => {
  const f = await fixture(t);
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  const saved = JSON.parse(await readFile(f.statePath, 'utf8'));
  assert.equal(saved.verification.status, 'passed');
  assert.equal(saved.verification.exitCode, 0);
  assert.equal(saved.verification.cwd, await realpath(f.generated));
  assert.ok(saved.verification.output.includes('addition checked'));
  assert.equal(saved.verification.files['solution.mjs'], createHash('sha256').update(f.source).digest('hex'));
  const next = await new GuardrailLoop().advancePhase(saved.session);
  assert.equal(next.phase, 'remember', 'the recorded artifact must satisfy the phase guard');
});

test('incorrect generated code fails verification even with a high heuristic score', async t => {
  const f = await fixture(t, 'export const add = (a, b) => a - b;\n');
  const result = f.run();
  assert.notEqual(result.status, 0, result.stdout);
  const saved = JSON.parse(await readFile(f.statePath, 'utf8'));
  assert.equal(saved.verification?.status, 'failed');
  assert.notEqual(saved.verification.exitCode, 0);
});

test('incomplete task generation cannot be verified by an unrelated successful command', async t => {
  const f = await fixture(t);
  f.state.tasks.push({ id: 'task-2', description: 'unfinished work', status: 'pending' });
  await writeFile(f.statePath, JSON.stringify(f.state));
  const result = f.run(`${JSON.stringify(process.execPath)} -e "process.exit(0)"`);
  assert.notEqual(result.status, 0);
  assert.notEqual(JSON.parse(await readFile(f.statePath, 'utf8')).verification?.status, 'passed');
});

test('a failed recheck replaces earlier success rather than leaving stale evidence', async t => {
  const f = await fixture(t);
  const first = f.run();
  assert.equal(first.status, 0, first.stderr);
  await writeFile(join(f.generated, 'check.mjs'), 'process.exit(7);\n');
  const second = f.run();
  assert.notEqual(second.status, 0);
  const saved = JSON.parse(await readFile(f.statePath, 'utf8'));
  assert.equal(saved.verification.status, 'failed');
  assert.equal(saved.verification.exitCode, 7);
});

test('a command that changes generated output cannot certify the previous output', async t => {
  const f = await fixture(t);
  await writeFile(join(f.generated, 'check.mjs'), "import {writeFile} from 'node:fs/promises';\nawait writeFile('solution.mjs','export const add = () => 0;');\n");
  const result = f.run();
  assert.notEqual(result.status, 0);
  const saved = JSON.parse(await readFile(f.statePath, 'utf8'));
  assert.equal(saved.verification?.status, 'failed');
});

test('missing generated output invalidates earlier verification before command execution', async t => {
  const f = await fixture(t);
  const first = f.run();
  assert.equal(first.status, 0, first.stderr);
  await rm(f.output);
  const second = f.run();
  assert.notEqual(second.status, 0);
  const saved = JSON.parse(await readFile(f.statePath, 'utf8'));
  assert.notEqual(saved.verification?.status, 'passed');
});
