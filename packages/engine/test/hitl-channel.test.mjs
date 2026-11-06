import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ConsoleHitlChannel } from '@x/hitl';
import { shouldInterrupt } from '../dist/index.js';

const state = { session: { mode: 'guardrail' } };

test('a non-CLI caller uses its injected approval channel rather than terminal stdin', async (t) => {
  t.mock.method(ConsoleHitlChannel.prototype, 'ask', async () => { throw new Error('Unexpected terminal prompt'); });
  let prompt;
  const channel = { ask: async (request) => { prompt = request; return { chosen: 'proceed' }; } };
  assert.equal(await shouldInterrupt('ticket-plan', state, channel), false);
  assert.equal(prompt.options.find(o => o.id === 'cancel').label, 'Cancel');
});

test('a cancelled injected approval interrupts work and an unknown choice cannot approve it', async (t) => {
  t.mock.method(ConsoleHitlChannel.prototype, 'ask', async () => { throw new Error('Unexpected terminal prompt'); });
  assert.equal(await shouldInterrupt('ticket-plan', state, { ask: async () => ({ chosen: 'cancel' }) }), true);
  assert.equal(await shouldInterrupt('ticket-plan', state, { ask: async () => ({ chosen: 'unrecognized' }) }), true);
});
