import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DesktopHitlChannel } from '../dist/shared/desktop-hitl-channel.js';

const request = { question: 'Write planned files?', tier: 0, options: [
  { id: 'proceed', label: 'Proceed', summary: 'Write files' },
  { id: 'cancel', label: 'Cancel', summary: 'Stop' },
] };

test('Stop resolves every pending desktop approval and late replies cannot resume them', async () => {
  const events = [];
  const controller = new AbortController();
  const channel = new DesktopHitlChannel({ send: (_name, event) => events.push(event) }, 'session-a', controller.signal);
  const first = channel.ask(request);
  const second = channel.ask(request);
  controller.abort();
  assert.deepEqual((await Promise.all([first, second])).map(r => r.chosen), ['cancel', 'cancel']);
  for (const event of events) assert.equal(channel.respond(event.request.id, 'approve'), false);
});

test('already-aborted desktop runs cannot open a new approval or restart after a stale response', async () => {
  const controller = new AbortController();
  controller.abort();
  const channel = new DesktopHitlChannel({ send: () => { throw new Error('Prompt must stay closed'); } }, 'session-b', controller.signal);
  assert.equal((await channel.ask(request)).chosen, 'cancel');
  assert.equal(channel.respond('stale-id', 'approve'), false);
});
