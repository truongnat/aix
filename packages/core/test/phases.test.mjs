import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GuardrailLoop } from '../dist/index.js';

test('verified evidence advances to remembering without fabricating shipment', async () => {
  const loop = new GuardrailLoop();
  let state = await loop.createSession('record verified work');
  state = { ...state, phase: 'verify' };
  state = loop.addEvidence(state, { phase: 'verify', kind: 'artifact', ref: 'VERIFY.md', summary: 'Command evidence recorded' });
  const next = await loop.advancePhase(state);
  assert.equal(next.phase, 'remember');
});
