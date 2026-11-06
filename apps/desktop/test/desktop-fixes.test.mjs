import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isCurrentSpineSession,
  providerEnvironmentFor,
} from '../dist/shared/desktop-logic.js';

test('spine events are accepted only for the currently active non-empty session', () => {
  assert.equal(isCurrentSpineSession('', 'session-1'), false);
  assert.equal(isCurrentSpineSession('session-1', ''), false);
  assert.equal(isCurrentSpineSession('session-1', 'session-2'), false);
  assert.equal(isCurrentSpineSession('session-1', 'session-1'), true);
});

test('desktop AI config maps only the selected provider to runtime environment values', () => {
  assert.deepEqual(providerEnvironmentFor({
    provider: 'openai',
    model: 'gpt-test',
    apiKey: 'openai-test-key',
    baseUrl: 'https://proxy.example/v1',
  }), {
    AIX_PROVIDER: 'openai',
    AIX_MODEL: 'gpt-test',
    AIX_API_KEY: 'openai-test-key',
    AIX_API_URL: 'https://proxy.example/v1',
  });
});

test('desktop AI config supports local Ollama without requiring an API key', () => {
  assert.deepEqual(providerEnvironmentFor({ provider: 'ollama', model: 'local-model' }), {
    AIX_PROVIDER: 'ollama',
    AIX_MODEL: 'local-model',
  });
});
