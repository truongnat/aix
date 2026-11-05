import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDefaultBudgetState } from '@x/core';
import { SessionStore, FileCheckpointer, createInitialEngineState, coderNode, discussNode, planNode, sessionArtifactPath, sessionGeneratedDir } from '@x/engine';

const secret = `ghp_${'c'.repeat(36)}`;
const timestamp = '2026-11-05T11:22:33.444Z';
function initial(id = '019a5555-1234-7654-8765-abcdef012345') {
  return createInitialEngineState({ id, task: `implement ${secret}`, mode: 'autonomous', phase: 'run', createdAt: timestamp, evidence: [], budget: createDefaultBudgetState(10) });
}
async function temporaryRoot(t) {
  const root = await mkdtemp(join(tmpdir(), 'aix-persistence-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
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

test('SessionStore sanitizes nested strings before disk write while preserving state shape and numeric budget', async t => {
  const root = await temporaryRoot(t);
  const store = new SessionStore(root);
  const state = { ...initial(), coderOutput: `credential ${secret}`, tasks: [{ id: 'task-1234567890', description: secret, status: 'done', output: secret }], attempts: 2 };
  await store.save(state);
  const raw = await readFile(join(root, state.session.id, 'state.json'), 'utf8');
  assert.equal(raw.includes(secret), false);
  const loaded = await store.load(state.session.id);
  assert.equal(loaded.session.task, 'implement ••••');
  assert.equal(loaded.tasks[0].output, '••••');
  assert.equal(loaded.tasks[0].id, 'task-1234567890');
  assert.equal(loaded.session.createdAt, timestamp);
  assert.deepEqual(loaded.session.budget, state.session.budget);
  assert.equal(loaded.attempts, 2);
  assert.equal(state.coderOutput, `credential ${secret}`);
});

test('SessionStore rejects secret-bearing session IDs rather than leaking or renaming paths', async t => {
  const root = await temporaryRoot(t);
  await assert.rejects(new SessionStore(root).save(initial(secret)), /secret/i);
  assert.deepEqual(await readdir(root), []);
});

test('FileCheckpointer rejects secrets in checkpoint identity before writing files', async t => {
  const root = await temporaryRoot(t);
  const saver = new FileCheckpointer(root);
  const checkpoint = { v: 4, id: secret, ts: timestamp, channel_values: {}, channel_versions: {}, versions_seen: {}, pending_sends: [] };
  await assert.rejects(saver.put({ configurable: { thread_id: 'safe-thread' } }, checkpoint, { source: 'loop', step: 1, parents: {} }), /secret/i);
  assert.deepEqual(await readdir(root), []);
});

test('FileCheckpointer sanitizes checkpoint values, metadata, and pending writes before serialization', async t => {
  const root = await temporaryRoot(t);
  const saver = new FileCheckpointer(root);
  const config = { configurable: { thread_id: 'thread-1234567890', checkpoint_ns: '' } };
  const checkpoint = { v: 4, id: '019a5555-1234-7654-8765-abcdef012345', ts: timestamp, channel_values: { state: { message: secret, count: 5000 } }, channel_versions: { state: 1 }, versions_seen: {}, pending_sends: [] };
  const metadata = { source: 'loop', step: 1234, parents: {}, note: secret };
  const saved = await saver.put(config, checkpoint, metadata);
  await saver.putWrites(saved, [['state', { text: secret, count: 5000 }]], 'task-1234567890');
  const tuple = await saver.getTuple(saved);
  assert.ok(tuple);
  assert.equal(tuple.checkpoint.channel_values.state.message, '••••');
  assert.equal(tuple.checkpoint.channel_values.state.count, 5000);
  assert.equal(tuple.checkpoint.id, checkpoint.id);
  assert.equal(tuple.checkpoint.ts, timestamp);
  assert.equal(tuple.metadata.note, '••••');
  assert.equal(tuple.metadata.step, 1234);
  assert.deepEqual(tuple.pendingWrites, [['task-1234567890', 'state', { text: '••••', count: 5000 }]]);
  assert.equal(checkpoint.channel_values.state.message, secret);
  const dir = join(root, config.configurable.thread_id, 'checkpoints', '__default__');
  for (const file of await readdir(dir)) {
    const disk = JSON.parse(await readFile(join(dir, file), 'utf8'));
    const payloads = Array.isArray(disk) ? disk.map(write => write[2]) : [disk.checkpoint, disk.metadata];
    for (const payload of payloads) assert.equal(Buffer.from(payload).toString('utf8').includes(secret), false);
  }
});

test('coder rejects recognized secrets without creating a generated sandbox or leaking the secret in errors', async t => {
  const id = `secret-output-${process.pid}-${Date.now()}`;
  const dir = sessionGeneratedDir(id);
  t.after(() => rm(join(dir, '..'), { recursive: true, force: true }));
  providerResponse(t, `export const credential = '${secret}';`);
  const state = initial(id);
  const current = { id: 'task-1', description: 'implement credential handling', status: 'pending' };
  await assert.rejects(coderNode({ ...state, tasks: [current], current }), error => {
    assert.match(error.message, /secret/i);
    assert.equal(error.message.includes(secret), false);
    return true;
  });
  assert.equal(existsSync(dir), false);
});

test('coder preserves generated source numeric literals byte for byte', async t => {
  const id = `numeric-output-${process.pid}-${Date.now()}`;
  const dir = sessionGeneratedDir(id);
  t.after(() => rm(join(dir, '..'), { recursive: true, force: true }));
  const source = 'export const timeout = 5000; export const count = 1234567890;\n';
  providerResponse(t, source);
  const current = { id: 'task-1', description: 'implement numeric settings', status: 'pending' };
  const next = await coderNode({ ...initial(id), current, tasks: [current] });
  assert.equal(await readFile(next.writtenFiles[0], 'utf8'), source);
  assert.equal(next.coderOutput, source);
});

for (const node of ['discuss', 'plan']) {
  test(`${node} persists sanitized metadata without mutating scores or numbers`, async t => {
    const id = `${node}-redaction-${process.pid}-${Date.now()}`;
    const artifact = sessionArtifactPath(id, node === 'discuss' ? 'DISCUSSION.md' : 'PLAN.md');
    t.after(() => rm(join(artifact, '..'), { recursive: true, force: true }));
    const payload = node === 'discuss'
      ? { goal: secret, constraints: [secret], options: [{ name: secret, value: 8, effortFit: 7, risk: 6, fit: 9 }], recommendation: secret, rationale: secret }
      : { goal: secret, scope: secret, tasks: [{ title: secret, description: secret, acceptanceCriteria: [secret], files: ['src/settings.ts'] }], verificationStrategy: `Check ${secret}`, risks: [secret] };
    providerResponse(t, JSON.stringify(payload));
    const next = await (node === 'discuss' ? discussNode : planNode)(initial(id));
    const raw = await readFile(artifact, 'utf8');
    assert.equal(raw.includes(secret), false);
    assert.equal((node === 'discuss' ? next.discussion : next.plan).goal, '••••');
    if (node === 'discuss') assert.deepEqual(next.discussion.options[0], { name: '••••', value: 8, effortFit: 7, risk: 6, fit: 9 });
  });
}
