import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SessionStore, FileCheckpointer, createInitialEngineState } from '@x/engine';
import { createDefaultBudgetState } from '@x/core';

const timestamp = '2026-11-05T11:22:33.444Z';
const secret = `ghp_${'d'.repeat(36)}`;
function stateFixture() {
  const state = createInitialEngineState({ id: 'alice@example.com', task: `help alice@example.com ${secret}`, mode: 'autonomous', phase: 'verify', createdAt: timestamp, budget: createDefaultBudgetState(10), evidence: [{ phase: 'verify', kind: 'artifact', summary: secret, ref: '/tmp/alice@example.com/VERIFY.md', contentHash: '0123456789abcdef'.repeat(4), at: timestamp }] });
  const current = { id: 'task@example.com', description: secret, status: 'done', output: secret };
  return { ...state, tasks: [current], current, ticketPlans: [{ ticketId: 'ticket@example.com', description: secret, dependencies: [], files: ['127.0.0.1/a.ts'], acceptanceCriteria: [secret] }], writtenFiles: ['/tmp/alice@example.com/project/generated/127.0.0.1/a.ts'], verification: { status: 'passed', command: 'node check.mjs', cwd: '/tmp/alice@example.com/project/generated', exitCode: 0, output: secret, checkedAt: timestamp, files: { '127.0.0.1/a.ts': '0123456789abcdef'.repeat(4) } } };
}
async function root(t) {
  const dir = await mkdtemp(join(tmpdir(), 'aix-reference-roundtrip-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}
function assertRoundtrip(actual, input) {
  assert.equal(actual.session.id, input.session.id);
  assert.equal(actual.session.evidence[0].ref, input.session.evidence[0].ref);
  assert.equal(actual.session.evidence[0].contentHash, input.session.evidence[0].contentHash);
  assert.equal(actual.tasks[0].id, input.tasks[0].id);
  assert.equal(actual.current.id, input.current.id);
  assert.equal(actual.ticketPlans[0].ticketId, input.ticketPlans[0].ticketId);
  assert.deepEqual(actual.ticketPlans[0].files, input.ticketPlans[0].files);
  assert.deepEqual(actual.writtenFiles, input.writtenFiles);
  assert.equal(actual.verification.cwd, input.verification.cwd);
  assert.deepEqual(actual.verification.files, input.verification.files);
  assert.equal(actual.session.task, 'help •••• ••••');
  assert.equal(actual.tasks[0].description, '••••');
  assert.equal(actual.ticketPlans[0].acceptanceCriteria[0], '••••');
  assert.equal(actual.verification.output, '••••');
}

test('SessionStore preserves accepted operational references while redacting prose', async t => {
  const store = new SessionStore(await root(t));
  const state = stateFixture();
  await store.save(state);
  assertRoundtrip(await store.load(state.session.id), state);
});

test('FileCheckpointer roundtrips engine channels and pending writes with accepted email/IP-shaped references', async t => {
  const saver = new FileCheckpointer(await root(t));
  const state = stateFixture();
  const checkpoint = { v: 4, id: 'checkpoint@example.com', ts: timestamp, channel_values: { ...state, '__start__': state }, channel_versions: {}, versions_seen: {}, pending_sends: [] };
  const config = await saver.put({ configurable: { thread_id: state.session.id } }, checkpoint, { source: 'loop', step: 1, parents: {} });
  await saver.putWrites(config, [...Object.entries(state), ['__start__', state]], 'task@example.com');
  const tuple = await saver.getTuple(config);
  assertRoundtrip(tuple.checkpoint.channel_values, state);
  assertRoundtrip(tuple.checkpoint.channel_values.__start__, state);
  assertRoundtrip(Object.fromEntries(tuple.pendingWrites.map(([, channel, value]) => [channel, value])), state);
  assertRoundtrip(tuple.pendingWrites.find(([, channel]) => channel === '__start__')[2], state);
});

for (const target of ['evidence', 'task', 'current', 'ticketId', 'ticketFile', 'writtenFile', 'verificationCwd', 'verificationFile']) {
  test(`secret-bearing operational ${target} rejects before SessionStore or checkpoint writes`, async t => {
    const state = stateFixture();
    if (target === 'evidence') state.session.evidence[0].ref = `/tmp/${secret}/VERIFY.md`;
    if (target === 'task') state.tasks = [{ ...state.tasks[0], id: secret }];
    if (target === 'current') state.current = { ...state.current, id: secret };
    if (target === 'ticketId') state.ticketPlans[0].ticketId = secret;
    if (target === 'ticketFile') state.ticketPlans[0].files = [`${secret}/a.ts`];
    if (target === 'writtenFile') state.writtenFiles = [`/tmp/${secret}/a.ts`];
    if (target === 'verificationCwd') state.verification.cwd = `/tmp/${secret}`;
    if (target === 'verificationFile') state.verification.files = { [`${secret}/a.ts`]: 'a'.repeat(64) };
    const dir = await root(t);
    await assert.rejects(new SessionStore(dir).save(state), /secret/i);
    assert.deepEqual(await readdir(dir), []);
    const saver = new FileCheckpointer(dir);
    const checkpoint = { v: 4, id: 'safe-checkpoint', ts: timestamp, channel_values: state, channel_versions: {}, versions_seen: {}, pending_sends: [] };
    await assert.rejects(saver.put({ configurable: { thread_id: 'safe-thread' } }, checkpoint, { source: 'loop', step: 1, parents: {} }), /secret/i);
    assert.deepEqual(await readdir(dir), []);
    const [channel, value] = target === 'evidence' ? ['session', state.session] : target.startsWith('verification') ? ['verification', state.verification] : target === 'current' ? ['current', state.current] : target === 'task' ? ['tasks', state.tasks] : target.startsWith('ticket') ? ['ticketPlans', state.ticketPlans] : ['writtenFiles', state.writtenFiles];
    await assert.rejects(saver.putWrites({ configurable: { thread_id: 'safe-thread', checkpoint_id: 'safe-checkpoint' } }, [[channel, value]], 'safe-task'), /secret/i);
    assert.deepEqual(await readdir(dir), []);
  });
}
