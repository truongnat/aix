import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listSessionFiles, readSessionFile } from '../dist/shared/session-list.js';

async function setup(t) {
  const root = await mkdtemp(join(tmpdir(), 'aix-session-files-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'session-1', 'generated', 'bin'), { recursive: true });
  await writeFile(join(root, 'session-1', 'generated', 'bin', 'todo.js'), 'console.log("todo");');
  await writeFile(join(root, 'session-1', 'state.json'), 'private state');
  await symlink(join(root, 'session-1', 'state.json'), join(root, 'session-1', 'generated', 'leak.js'));
  return root;
}

test('source viewer lists nested generated files and reads their exact text', async t => {
  const root = await setup(t);
  assert.deepEqual(await listSessionFiles(root, 'session-1'), ['bin/todo.js']);
  assert.equal(await readSessionFile(root, 'session-1', 'bin/todo.js'), 'console.log("todo");');
});

test('source viewer refuses traversal, invalid session ids and symlinks outside generated files', async t => {
  const root = await setup(t);
  await assert.rejects(readSessionFile(root, 'session-1', '../state.json'), /outside|escapes|path/i);
  await assert.rejects(readSessionFile(root, '../session-1', 'bin/todo.js'), /session/i);
  await assert.rejects(readSessionFile(root, 'session-1', 'leak.js'), /outside|escapes|path/i);
});
