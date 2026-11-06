import { redact } from '@x/policy';

export interface ModelCallOptions {
  readonly system: string;
  readonly user: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
}

export interface ModelCallResponse {
  readonly content: string;
  readonly tokens: number;
  readonly usd: number;
}

export interface RuntimeProvider {
  readonly id: string;
  call(opts: ModelCallOptions): Promise<ModelCallResponse>;
}

/** Deterministic offline responses matching the engine's structured contracts. */
function generateMockResponse(opts: ModelCallOptions): string {
  const { system, user } = opts;
  const task = /Task:\s*([^\n]+)/.exec(user)?.[1] ?? user.split('\n')[0] ?? 'Offline demo task';
  const goal = `[Mock] ${task}`;

  if (system.includes('"files"') && system.includes('"content"')) {
    const targetsLine = /Declared file targets:\s*(\[[^\n]+\])/.exec(user)?.[1];
    let targets: string[] = [];
    try { targets = targetsLine ? JSON.parse(targetsLine) : []; } catch { /* Invalid request is rejected by the engine. */ }
    return JSON.stringify({ files: targets.map(path => ({
      path,
      content: path.endsWith('.json')
        ? JSON.stringify({ name: 'mock-output', description: 'Offline demo output — not a real implementation' }, null, 2) + '\n'
        : path.endsWith('.md')
          ? `# Offline demo output\n\nMock provider output for: ${task}\n\nConfigure a real provider to generate an implementation.\n`
          : `// Offline demo output — not a real implementation.\n// Configure a real provider to generate code for: ${task.replace(/\n/g, ' ')}\nexport const mockOutput = true;\n`,
    })) });
  }

  if (system.includes('"tasks"')) {
    return JSON.stringify({
      goal,
      scope: 'Offline demo only. No real implementation is generated.',
      constraints: ['Mock provider — deterministic test output'],
      tasks: [{
        id: 'task-1',
        title: 'Generate an offline demo artifact',
        description: `Write a labeled demo artifact for: ${task}`,
        dependencies: [],
        acceptanceCriteria: ['Output is explicitly labeled as a mock demo'],
        files: ['README.md'],
      }],
      verificationStrategy: 'Inspect the labeled demo artifact',
    });
  }

  if (system.includes('"recommendation"') || system.includes('engineering analyst')) {
    return JSON.stringify({
      goal,
      constraints: ['Mock provider — deterministic offline demo, not a real implementation'],
      options: [{ name: 'Offline demo', value: 1, effortFit: 10, risk: 1, fit: 1 }],
      recommendation: 'Offline demo',
      rationale: 'Mock mode demonstrates the workflow without a network call. Configure a real provider for useful code.',
    });
  }

  return JSON.stringify({ message: `[Mock] Offline demo response for: ${task}` });
}

export class MockRuntimeProvider implements RuntimeProvider {
  readonly id = 'mock';

  async call(opts: ModelCallOptions): Promise<ModelCallResponse> {
    const content = generateMockResponse(opts);
    const tokens = Math.ceil(content.length / 4);
    return { content, tokens, usd: 0.001 };
  }
}

export interface ProviderRuntimeConfig {
  readonly provider: string;
  readonly apiKey: string;
  readonly oauthToken: string;
  readonly oauthAccountId: string;
  readonly apiUrl: string;
  readonly model: string;
}

const PROVIDER_KEY_ENV: Readonly<Record<string, string>> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  groq: 'GROQ_API_KEY',
  inferx: 'INFERX_API_KEY',
};

/** Checks if a URL points to localhost or private network where auth is typically optional. */
export function isLocalOrCustomEndpoint(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0' || hostname.endsWith('.local');
  } catch {
    return false;
  }
}

/** Normalizes any base URL to an OpenAI-compatible /chat/completions endpoint. */
export function normalizeCompletionsUrl(url: string): string {
  const clean = url.trim().replace(/\/+$/, '');
  if (clean.endsWith('/chat/completions')) return clean;
  if (clean.endsWith('/v1')) return `${clean}/chat/completions`;
  return `${clean}/v1/chat/completions`;
}

export function resolveProviderRuntimeConfig(env: NodeJS.ProcessEnv = process.env): ProviderRuntimeConfig {
  const defaultOpenAiUrl = env['OPENAI_BASE_URL']
    ? normalizeCompletionsUrl(env['OPENAI_BASE_URL'])
    : 'https://api.openai.com/v1/chat/completions';
  const inferredProvider = env['OPENAI_BASE_URL'] ? 'openai'
    : env['ANTHROPIC_API_KEY'] ? 'anthropic'
    : env['OPENAI_API_KEY'] ? 'openai'
    : env['GROQ_API_KEY'] ? 'groq'
    : env['INFERX_API_KEY'] ? 'inferx'
    : 'anthropic';
  const provider = env['AIX_PROVIDER'] ?? inferredProvider;
  const apiUrl = env['AIX_API_URL'] ?? (
    provider === 'anthropic' ? (env['ANTHROPIC_BASE_URL'] ?? 'https://api.anthropic.com/v1/messages')
    : provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions'
    : provider === 'inferx' ? 'https://model.inferx.net/endpoints/v1/chat/completions'
    : provider === 'ollama' ? 'http://127.0.0.1:11434/v1/chat/completions'
    : provider === 'codex' ? 'https://chatgpt.com/backend-api/codex/responses'
    : defaultOpenAiUrl
  );
  const model = env['AIX_MODEL'] ?? env['OPENAI_MODEL'] ?? (
    provider === 'anthropic' ? (env['ANTHROPIC_MODEL'] ?? 'claude-sonnet-4-6')
    : provider === 'groq' ? (env['GROQ_MODEL'] ?? 'llama3-70b-8192')
    : provider === 'inferx' ? (env['INFERX_MODEL'] ?? 'deepseek-v4.1-flash-1017-basic')
    : provider === 'ollama' ? 'deepseek-r1:latest'
    : provider === 'codex' ? 'gpt-5.1-codex-max'
    : 'gpt-4o'
  );

  return {
    provider,
    apiKey: env['AIX_API_KEY'] ?? env[PROVIDER_KEY_ENV[provider] ?? ''] ?? '',
    oauthToken: env['AIX_OAUTH_TOKEN'] ?? '',
    oauthAccountId: env['AIX_OAUTH_ACCOUNT_ID'] ?? '',
    apiUrl,
    model,
  };
}

/**
 * Codex CLI login (ChatGPT subscription). Talks to the ChatGPT backend
 * Responses API, which streams SSE events only.
 */
export class CodexRuntimeProvider implements RuntimeProvider {
  readonly id = 'codex';
  readonly #oauthToken: string;
  readonly #accountId: string;
  readonly #apiUrl: string;
  readonly #model: string;

  constructor(opts?: { oauthToken?: string; accountId?: string; apiUrl?: string; model?: string }) {
    const resolved = resolveProviderRuntimeConfig({ ...process.env, AIX_PROVIDER: 'codex' });
    this.#oauthToken = opts?.oauthToken ?? resolved.oauthToken;
    this.#accountId = opts?.accountId ?? resolved.oauthAccountId;
    this.#apiUrl = opts?.apiUrl ?? resolved.apiUrl;
    this.#model = opts?.model ?? resolved.model;
    if (!this.#oauthToken) {
      throw new Error('Codex subscription token is missing. Open the Codex CLI once to log in, then retry.');
    }
  }

  async call(opts: ModelCallOptions): Promise<ModelCallResponse> {
    const res = await fetch(this.#apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.#oauthToken}`,
        'chatgpt-account-id': this.#accountId,
        'OpenAI-Beta': 'responses=experimental',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model: this.#model,
        instructions: opts.system,
        input: [{ role: 'user', content: [{ type: 'input_text', text: opts.user }] }],
        stream: true,
        store: false,
      }),
    });

    if (!res.ok || !res.body) {
      const result = redact(await res.text().catch(() => ''));
      if (res.status === 401) {
        throw new Error('Codex subscription token was rejected (401). Open the Codex CLI once to refresh the login, then retry.');
      }
      throw new Error(`Codex API error: ${res.status} ${result.clean}`);
    }

    let content = '';
    let tokens = 0;
    const decoder = new TextDecoder();
    let buffer = '';
    let eventType = '';
    for await (const chunk of res.body) {
      buffer += decoder.decode(chunk as Uint8Array, { stream: true });
      let newlineIndex = buffer.indexOf('\n');
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        if (line.startsWith('event:')) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith('data:') && eventType) {
          const payload = line.slice(5).trim();
          if (payload && payload !== '[DONE]') {
            try {
              const data = JSON.parse(payload) as {
                delta?: string;
                response?: { usage?: { input_tokens?: number; output_tokens?: number } };
              };
              if (eventType === 'response.output_text.delta' && data.delta) content += data.delta;
              if (eventType === 'response.completed' && data.response?.usage) {
                tokens = (data.response.usage.input_tokens ?? 0) + (data.response.usage.output_tokens ?? 0);
              }
            } catch {
              // Ignore malformed SSE frames; the stream continues.
            }
          }
          eventType = '';
        }
        newlineIndex = buffer.indexOf('\n');
      }
    }

    // ChatGPT subscription calls are not metered per token; this blended
    // estimate only feeds the budget guard.
    const usd = (tokens * 5) / 1_000_000;
    return { content, tokens, usd };
  }
}

export class ApiRuntimeProvider implements RuntimeProvider {
  readonly id: string;
  readonly #apiKey: string;
  readonly #oauthToken: string;
  readonly #apiUrl: string;
  readonly #model: string;

  constructor(opts?: { provider?: string; apiKey?: string; oauthToken?: string; apiUrl?: string; model?: string }) {
    const env: NodeJS.ProcessEnv = { ...process.env };
    if (opts?.provider && env['AIX_PROVIDER'] && env['AIX_PROVIDER'] !== opts.provider) {
      delete env['AIX_API_KEY'];
      delete env['AIX_API_URL'];
      delete env['AIX_MODEL'];
      delete env['AIX_OAUTH_TOKEN'];
    }
    if (opts?.provider) env['AIX_PROVIDER'] = opts.provider;
    const resolved = resolveProviderRuntimeConfig(env);
    this.id = opts?.provider ?? resolved.provider;
    this.#apiKey = opts?.apiKey ?? resolved.apiKey;
    this.#oauthToken = opts?.oauthToken ?? resolved.oauthToken;
    this.#apiUrl = opts?.apiUrl ?? resolved.apiUrl;
    this.#model = opts?.model ?? resolved.model;
  }

  async call(opts: ModelCallOptions): Promise<ModelCallResponse> {
    const isKeyless = this.id === 'ollama' || isLocalOrCustomEndpoint(this.#apiUrl);
    if (!this.#apiKey && !this.#oauthToken && !isKeyless) {
      throw new Error(`API key is missing for the selected ${this.id} provider`);
    }

    if (this.id === 'anthropic') {
      return this.#callAnthropic(opts);
    }
    return this.#callOpenAI(opts);
  }

  async #callAnthropic(opts: ModelCallOptions): Promise<ModelCallResponse> {
    // Subscription tokens (Claude Code CLI login) authenticate with Bearer +
    // the oauth beta header; API keys use the x-api-key scheme.
    const authHeaders: Record<string, string> = this.#oauthToken
      ? {
          'Authorization': `Bearer ${this.#oauthToken}`,
          'anthropic-beta': 'oauth-2025-04-20',
          'User-Agent': 'claude-cli/aix-desktop (external, cli)',
        }
      : { 'x-api-key': this.#apiKey };

    const res = await fetch(this.#apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        'anthropic-version': '2023-06-01',
      },
      // No `temperature`: current Claude models reject it with a 400.
      body: JSON.stringify({
        model: this.#model,
        system: opts.system,
        messages: [{ role: 'user', content: opts.user }],
        max_tokens: opts.maxTokens ?? 4096,
      }),
    });

    if (!res.ok) {
      const result = redact(await res.text());
      throw new Error(`Anthropic API error: ${res.status} ${result.clean}`);
    }

    const data = await res.json() as {
      content: Array<{ text: string }>;
      usage: { input_tokens: number; output_tokens: number };
    };

    const content = data.content.map(c => c.text).join('\n');
    const tokens = data.usage.input_tokens + data.usage.output_tokens;
    const usd = (data.usage.input_tokens * 3 + data.usage.output_tokens * 15) / 1_000_000;

    return { content, tokens, usd };
  }

  async #callOpenAI(opts: ModelCallOptions, attempt = 1, omitTemperature = false): Promise<ModelCallResponse> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.#apiKey) headers['Authorization'] = `Bearer ${this.#apiKey}`;
    const body: Record<string, unknown> = {
      model: this.#model,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
      max_tokens: opts.maxTokens ?? 4096,
    };
    if (!omitTemperature && opts.temperature !== undefined) {
      body['temperature'] = opts.temperature;
    } else if (!omitTemperature) {
      body['temperature'] = 0.7;
    }

    const targetUrl = normalizeCompletionsUrl(this.#apiUrl);
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const result = redact(await res.text());
      if (res.status === 400 && attempt === 1 && /temperature/i.test(result.clean)) {
        // Auto-retry without temperature: reasoning models (o1, o3) and proxy gateways reject temperature.
        return this.#callOpenAI(opts, 2, true);
      }
      if (res.status === 429 && attempt < 4) {
        const delay = Math.min(1000 * 2 ** attempt, 8000);
        console.warn(`[provider] Rate limited (429). Retrying in ${delay}ms (attempt ${attempt}/3)...`);
        await new Promise(r => setTimeout(r, delay));
        return this.#callOpenAI(opts, attempt + 1, omitTemperature);
      }
      throw new Error(`OpenAI API error: ${res.status} ${result.clean}`);
    }

    const data = await res.json() as {
      choices: Array<{ message: { content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number };
    };

    const content = data.choices[0]?.message?.content ?? '';
    const tokens = data.usage.prompt_tokens + data.usage.completion_tokens;
    const usd = (data.usage.prompt_tokens * 2.5 + data.usage.completion_tokens * 10) / 1_000_000;

    return { content, tokens, usd };
  }
}

export function createProvider(env: NodeJS.ProcessEnv = process.env): RuntimeProvider {
  const config = resolveProviderRuntimeConfig(env);
  if (config.provider === 'mock') return new MockRuntimeProvider();
  if (config.provider === 'codex') return new CodexRuntimeProvider({ oauthToken: config.oauthToken, accountId: config.oauthAccountId, apiUrl: config.apiUrl, model: config.model });
  const isKeyless = config.provider === 'ollama' || isLocalOrCustomEndpoint(config.apiUrl);
  if (!config.apiKey && !config.oauthToken && !isKeyless) {
    if (env['AIX_PROVIDER']) {
      throw new Error(`API key is missing for the selected ${config.provider} provider`);
    }
    console.warn('[provider] No API key configured. Using mock provider.');
    return new MockRuntimeProvider();
  }
  return new ApiRuntimeProvider(config);
}
