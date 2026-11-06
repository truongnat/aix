import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasModelCredentials } from '../dist/shared/desktop-logic.js';

test('fresh hosted provider cannot send a task until a key or subscription is configured', () => {
  assert.equal(hasModelCredentials({ provider: 'anthropic', hasApiKey: false }), false);
  assert.equal(hasModelCredentials({ provider: 'anthropic', hasApiKey: true }), true);
  assert.equal(hasModelCredentials({ provider: 'anthropic', hasApiKey: false, useSubscription: true }), true);
  assert.equal(hasModelCredentials({ provider: 'openai', hasApiKey: false, baseUrl: 'https://gateway.example/v1' }), false);
});

test('local gateway, offline mock and detected CLI login have distinct credential requirements', () => {
  assert.equal(hasModelCredentials({ provider: 'openai', hasApiKey: false, baseUrl: 'http://127.0.0.1:1234/v1' }), true);
  assert.equal(hasModelCredentials({ provider: 'mock', hasApiKey: false }), true);
  assert.equal(hasModelCredentials({ provider: 'codex', hasApiKey: false }), false);
  assert.equal(hasModelCredentials({ provider: 'codex', hasApiKey: false }, [{ provider: 'codex', usable: true }]), true);
});
