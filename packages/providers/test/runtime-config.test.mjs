import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProvider, resolveProviderRuntimeConfig } from '../dist/index.js';

test('provider runtime config prefers the explicitly selected provider key, not a stale provider key', () => {
  const config = resolveProviderRuntimeConfig({
    AIX_PROVIDER: 'openai',
    AIX_MODEL: 'gpt-custom',
    AIX_API_KEY: 'selected-openai-key',
    AIX_API_URL: 'https://proxy.example/v1',
    ANTHROPIC_API_KEY: 'stale-anthropic-key',
  });

  assert.deepEqual(config, {
    provider: 'openai',
    apiKey: 'selected-openai-key',
    oauthToken: '',
    oauthAccountId: '',
    apiUrl: 'https://proxy.example/v1',
    model: 'gpt-custom',
  });
});

test('a Claude Code subscription token authenticates anthropic without any API key', () => {
  assert.equal(createProvider({ AIX_PROVIDER: 'anthropic', AIX_OAUTH_TOKEN: 'subscription-oauth-token' }).id, 'anthropic');
  assert.throws(() => createProvider({ AIX_PROVIDER: 'anthropic', AIX_OAUTH_TOKEN: '' }), /API key.*anthropic/i);
});

test('codex runs on the ChatGPT subscription via the Responses SSE endpoint', () => {
  const provider = createProvider({ AIX_PROVIDER: 'codex', AIX_OAUTH_TOKEN: 'codex-token', AIX_OAUTH_ACCOUNT_ID: 'acc-1' });
  assert.equal(provider.id, 'codex');
  assert.throws(() => createProvider({ AIX_PROVIDER: 'codex' }), /Codex CLI.*log in/i);
});

test('Ollama is a first-class local provider and does not silently fall back to mock', () => {
  assert.equal(createProvider({ AIX_PROVIDER: 'ollama', AIX_MODEL: 'qwen-local' }).id, 'ollama');
});

test('an explicitly selected hosted provider without a key fails clearly instead of using mock', () => {
  assert.throws(() => createProvider({ AIX_PROVIDER: 'openai' }), /API key.*openai/i);
});
