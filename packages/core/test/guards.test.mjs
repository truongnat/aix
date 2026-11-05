import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PhaseMachine, createDefaultGuards } from '../dist/index.js';

const session = (phase, evidence) => ({ id: 's', task: 't', mode: 'guardrail', phase, createdAt: '', evidence });
const artifact = (phase, ref, extra = {}) => ({ phase, kind: 'artifact', summary: 'generated', ref, at: '', ...extra });
const advance = (phase, evidence, options) => new PhaseMachine(createDefaultGuards(options)).advance(session(phase, evidence));

test('default guards still accept a well-formed artifact ref without disk checks', async () => {
  assert.equal((await advance('discuss', [artifact('discuss', '.aix/sessions/x/DISCUSSION.md')])).ok, true);
  assert.equal((await advance('verify', [artifact('verify', 'VERIFY.md')])).ok, true);
});

test('fake refs that merely contain the artifact name are rejected', async () => {
  for (const ref of ['NOT-DISCUSSION.md', 'DISCUSSION.md.bak', 'x/DISCUSSION.md/other', 'discussion.md', '']) {
    const r = await advance('discuss', [artifact('discuss', ref)]);
    assert.equal(r.ok, false, ref);
    assert.equal(r.error.code, 'GUARD_DISCUSS_MISSING');
  }
});

test('artifact evidence with blank summary and no content hash is rejected', async () => {
  const r = await advance('plan', [artifact('plan', 'PLAN.md', { summary: '   ' })]);
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'GUARD_PLAN_MISSING');
  const withHash = await advance('plan', [artifact('plan', 'PLAN.md', { summary: '', contentHash: 'abc123' })]);
  assert.equal(withHash.ok, true);
});

test('checkFileExists rejects missing and empty files, accepts non-empty ones', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'guards-'));
  const opts = { baseDir: dir, checkFileExists: true };

  const missing = await advance('run', [artifact('run', 'REVIEW.md')], opts);
  assert.equal(missing.ok, false);
  assert.equal(missing.error.code, 'GUARD_REVIEW_MISSING');

  writeFileSync(join(dir, 'REVIEW.md'), '');
  assert.equal((await advance('run', [artifact('run', 'REVIEW.md')], opts)).ok, false);

  writeFileSync(join(dir, 'REVIEW.md'), '# Review\n');
  assert.equal((await advance('run', [artifact('run', 'REVIEW.md')], opts)).ok, true);
  assert.equal((await advance('run', [artifact('run', join(dir, 'REVIEW.md'))], { checkFileExists: true })).ok, true);
});
