import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GuardrailLoop } from '@x/core';
import { revisePhase } from '../dist/index.js';

const loop = new GuardrailLoop();
const at = async phase => ({ ...(await loop.createSession('t')), phase });

test('revise after plan rewinds to plan', async () => {
  const state = revisePhase(loop, await at('run'), 'run');
  assert.equal(state.phase, 'plan');
  assert.ok(state.evidence.some(e => e.summary.startsWith('Rewind to "plan"')));
});

test('revise at plan stays on plan so the plan node re-runs', async () => {
  const state = revisePhase(loop, await at('plan'), 'plan');
  assert.equal(state.phase, 'plan');
});

test('revise at discuss stays on discuss (no forward jump)', async () => {
  const state = revisePhase(loop, await at('discuss'), 'discuss');
  assert.equal(state.phase, 'discuss');
});
