import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, utimes, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listDesktopSessions } from '../dist/shared/session-list.js';

async function fixtures(t) {
  const root = await mkdtemp(join(tmpdir(), 'aix-session-list-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const add = async (id, files) => {
    const dir = join(root, id);
    await mkdir(dir);
    for (const [name, content] of Object.entries(files)) {
      await writeFile(join(dir, name), typeof content === 'string' ? content : JSON.stringify(content));
    }
    return dir;
  };
  return { root, add };
}

test('sessions show task-derived names, nested phase and actual running status before any artifacts exist', async (t) => {
  const { root, add } = await fixtures(t);
  await add('live', { 'state.json': { session: { id: 'live', task: '  Fix   checkout validation\nDetailed constraints', phase: 'discuss' } } });
  const [session] = await listDesktopSessions(root, new Map([['live', {}]]));
  assert.equal(session.title, 'Fix checkout validation');
  assert.equal(session.phase, 'discuss');
  assert.equal(session.isRunning, true);
  assert.deepEqual(session.artifacts, []);
});

test('ordering follows latest file activity rather than directory creation and prioritizes an active run', async (t) => {
  const { root, add } = await fixtures(t);
  const olderDir = await add('older-dir', { 'state.json': { session: { task: 'Updated task', phase: 'plan' } } });
  const newerDir = await add('newer-dir', { 'state.json': { session: { task: 'Other task', phase: 'discuss' } } });
  const old = new Date('2025-01-01T00:00:00Z');
  const recent = new Date('2025-02-01T00:00:00Z');
  await utimes(join(olderDir, 'state.json'), recent, recent);
  await utimes(join(newerDir, 'state.json'), old, old);
  await utimes(olderDir, old, old);
  await utimes(newerDir, old, old);
  const listed = await listDesktopSessions(root);
  assert.deepEqual(listed.map(s => s.id), ['older-dir', 'newer-dir']);
  assert.equal(listed[0].updatedAt, recent.toISOString());
  const running = await listDesktopSessions(root, new Map([['newer-dir', {}]]));
  assert.equal(running[0].id, 'newer-dir');
  assert.equal(running[1].isRunning, false);
});

test('legacy sessions use first user message or readable folder name and a corrupt state does not hide others', async (t) => {
  const { root, add } = await fixtures(t);
  await add('old-chat', { 'state.json': '{broken', 'chat.jsonl': [
    JSON.stringify({ role: 'assistant', content: 'Greeting' }),
    JSON.stringify({ role: 'user', content: 'Add CSV export' }),
  ].join('\n') });
  await add('desktop-ui-review', { 'PLAN.md': '# Plan' });
  const listed = await listDesktopSessions(root);
  assert.equal(listed.find(s => s.id === 'old-chat').title, 'Add CSV export');
  assert.equal(listed.find(s => s.id === 'desktop-ui-review').title, 'desktop ui review');
  assert.deepEqual(listed.find(s => s.id === 'desktop-ui-review').artifacts, ['PLAN.md']);
});
