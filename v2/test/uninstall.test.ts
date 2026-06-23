import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { uninstallHarness } from '../src/lib/uninstall-harness.ts';

test('uninstallHarness removes all local install surfaces', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aih-v2-uninstall-local-'));
  const cwd = path.join(tempRoot, 'repo');
  fs.mkdirSync(path.join(cwd, '.ai-harness'), { recursive: true });
  fs.mkdirSync(path.join(cwd, '.claude'), { recursive: true });
  fs.mkdirSync(path.join(cwd, '.codex'), { recursive: true });
  fs.writeFileSync(path.join(cwd, '.ai-harness', '.harness.json'), '{}\n');
  fs.writeFileSync(path.join(cwd, '.claude', 'CLAUDE.md'), '# Claude\n');
  fs.writeFileSync(path.join(cwd, '.codex', 'AGENTS.md'), '# Codex\n');

  const removed = await uninstallHarness({ scope: 'local', cwd, homeDir: '/Users/example' });

  assert.deepEqual(removed, [
    path.join(cwd, '.ai-harness'),
    path.join(cwd, '.claude'),
    path.join(cwd, '.codex'),
  ]);
  assert.equal(fs.existsSync(path.join(cwd, '.ai-harness')), false);
  assert.equal(fs.existsSync(path.join(cwd, '.claude')), false);
  assert.equal(fs.existsSync(path.join(cwd, '.codex')), false);
});

test('uninstallHarness removes all global install surfaces', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aih-v2-uninstall-global-'));
  const fakeHome = path.join(tempRoot, 'home');
  fs.mkdirSync(path.join(fakeHome, '.ai-harness'), { recursive: true });
  fs.mkdirSync(path.join(fakeHome, '.claude'), { recursive: true });
  fs.mkdirSync(path.join(fakeHome, '.codex'), { recursive: true });
  fs.writeFileSync(path.join(fakeHome, '.ai-harness', '.harness.json'), '{}\n');

  const removed = await uninstallHarness({
    scope: 'global',
    cwd: '/repo/ignored',
    homeDir: fakeHome,
  });

  assert.deepEqual(removed, [
    path.join(fakeHome, '.ai-harness'),
    path.join(fakeHome, '.claude'),
    path.join(fakeHome, '.codex'),
  ]);
  assert.equal(fs.existsSync(path.join(fakeHome, '.ai-harness')), false);
  assert.equal(fs.existsSync(path.join(fakeHome, '.claude')), false);
  assert.equal(fs.existsSync(path.join(fakeHome, '.codex')), false);
});

test('uninstallHarness skips missing surfaces without failing', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aih-v2-uninstall-missing-'));
  const cwd = path.join(tempRoot, 'repo');
  fs.mkdirSync(cwd, { recursive: true });

  const removed = await uninstallHarness({ scope: 'local', cwd, homeDir: '/Users/example' });

  assert.deepEqual(removed, []);
});
