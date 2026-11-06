import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isCurrentSpineSession,
  providerEnvironmentFor,
  codexModelsFromCache,
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
test('desktop AI config maps custom OpenAI-compatible endpoint and model without requiring an API key', () => {
  assert.deepEqual(providerEnvironmentFor({ provider: 'openai', model: 'group/smart-mix', baseUrl: 'http://127.0.0.1:3425/v1' }), {
    AIX_PROVIDER: 'openai',
    AIX_MODEL: 'group/smart-mix',
    AIX_API_URL: 'http://127.0.0.1:3425/v1',
  });
});


test('subscription logins never inherit a custom endpoint, so their token cannot go to another host', () => {
  const staleEndpoint = 'https://model.inferx.net/endpoints/v1';
  assert.equal(
    providerEnvironmentFor({ provider: 'anthropic', model: 'claude-sonnet-5-5', baseUrl: staleEndpoint, useSubscription: true }).AIX_API_URL,
    undefined,
  );
  assert.equal(
    providerEnvironmentFor({ provider: 'codex', model: 'gpt-5', baseUrl: staleEndpoint }).AIX_API_URL,
    undefined,
  );
  assert.equal(
    providerEnvironmentFor({ provider: 'inferx', model: 'deepseek', apiKey: 'k', baseUrl: staleEndpoint }).AIX_API_URL,
    staleEndpoint,
  );
});

test('codex offers only native, listed models from the Codex CLI cache, ordered by priority', () => {
  const cache = {
    models: [
      { slug: 'gpt-6-sol', visibility: 'list', priority: 4 },
      { slug: 'gpt-6.1-sol', visibility: 'list', priority: 1 },
      { slug: 'group/smart-mix', visibility: 'list', priority: 10 },
      { slug: 'claude/claude-sonnet-5-5', visibility: 'list', priority: 14 },
      { slug: 'codex-auto-review', visibility: 'hide', priority: 52 },
    ],
  };
  assert.deepEqual(codexModelsFromCache(cache), ['gpt-6.1-sol', 'gpt-6-sol']);
  assert.deepEqual(codexModelsFromCache(null), []);
  assert.deepEqual(codexModelsFromCache({ models: 'not-a-list' }), []);
});
