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

test('anthropic requests omit temperature, which current Claude models reject', async () => {
  const bodies = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    bodies.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ content: [{ text: 'ok' }], usage: { input_tokens: 1, output_tokens: 1 } }), { status: 200 });
  };
  try {
    const provider = createProvider({ AIX_PROVIDER: 'anthropic', AIX_MODEL: 'claude-sonnet-5-5', AIX_OAUTH_TOKEN: 'subscription-oauth-token' });
    await provider.call({ system: 's', user: 'u', temperature: 0.3 });
    await provider.call({ system: 's', user: 'u' });
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(bodies.length, 2);
  for (const body of bodies) assert.equal('temperature' in body, false);
});

test('OPENAI_BASE_URL configures an OpenAI-compatible endpoint with optional key for local endpoints', async () => {
  const requests = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    requests.push({ url, headers: init.headers, body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
  };
  try {
    const provider = createProvider({
      OPENAI_BASE_URL: 'http://127.0.0.1:3425/v1',
      OPENAI_MODEL: 'group/smart-mix',
    });
    assert.equal(provider.id, 'openai');
    await provider.call({ system: 's', user: 'u', temperature: 0.3 });
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(requests.length, 1);
  const [request] = requests;
  assert.equal(request.url, 'http://127.0.0.1:3425/v1/chat/completions');
  assert.equal(request.body.model, 'group/smart-mix');
  assert.equal('Authorization' in request.headers, false);
});

test('OpenAI-compatible calls automatically retry without temperature when the endpoint rejects it', async () => {
  const bodies = [];
  let callCount = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    callCount++;
    bodies.push(JSON.parse(init.body));
    if (callCount === 1) {
      return new Response(JSON.stringify({ error: { message: '`temperature` is deprecated for this model.' } }), { status: 400 });
    }
    return new Response(JSON.stringify({ choices: [{ message: { content: 'fallback-ok' } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
  };
  try {
    const provider = createProvider({
      OPENAI_BASE_URL: 'http://127.0.0.1:8000/v1',
      OPENAI_MODEL: 'o3-mini',
    });
    const res = await provider.call({ system: 's', user: 'u', temperature: 0.3 });
    assert.equal(res.content, 'fallback-ok');
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(callCount, 2);
  assert.equal(bodies[0].temperature, 0.3);
  assert.equal('temperature' in bodies[1], false);
});
