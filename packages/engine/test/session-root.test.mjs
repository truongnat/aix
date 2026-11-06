import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { sessionArtifactPath, sessionGeneratedDir, sessionStatePath } from '@x/engine';

test('session artifact helpers use the configured sessions root at call time', t => {
  const priorRoot = process.env.AIX_SESSIONS_ROOT;
  process.env.AIX_SESSIONS_ROOT = '/tmp/aix-desktop-user-data/.aix/sessions';
  t.after(() => {
    if (priorRoot === undefined) delete process.env.AIX_SESSIONS_ROOT;
    else process.env.AIX_SESSIONS_ROOT = priorRoot;
  });

  assert.equal(sessionArtifactPath('session-1', 'PLAN.md'), join('/tmp/aix-desktop-user-data/.aix/sessions', 'session-1', 'PLAN.md'));
  assert.equal(sessionGeneratedDir('session-1'), join('/tmp/aix-desktop-user-data/.aix/sessions', 'session-1', 'generated'));
  assert.equal(sessionStatePath('session-1'), join('/tmp/aix-desktop-user-data/.aix/sessions', 'session-1', 'state.json'));
});
