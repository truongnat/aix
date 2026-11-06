import { readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { applyClaudeSubscriptionEnv, ensureClaudeSubscriptionToken, listClaudeCodeSubscription } from './cli-subscription.js';
import { codexModelsFromCache, isLocalOrCustomEndpoint } from '../shared/desktop-logic.js';

/**
 * Detects every usable model source on this machine — CLI logins
 * (Claude Code, Codex), local servers (Ollama), stored provider keys
 * (environment / omp models.yml) — so the renderer can offer a simple
 * "pick a model" list instead of manual API-key entry.
 *
 * Model lists follow the same pattern as pi/omp: a small static catalog as
 * offline fallback, refreshed with a LIVE listing from the provider as soon
 * as login credentials are available.
 */

export interface DesktopModelSource {
  readonly id: 'claude-code' | 'codex' | 'antigravity' | 'gemini' | 'ollama' | 'anthropic-key' | 'openai-key' | 'groq-key' | 'inferx-key' | 'mock';
  readonly name: string;
  readonly provider: 'anthropic' | 'codex' | 'openai' | 'groq' | 'inferx' | 'ollama' | 'mock';
  readonly authNote: string;
  readonly detected: boolean;
  /** True when the app can actually route calls through this source today. */
  readonly usable: boolean;
  readonly note: string;
  readonly models: readonly string[];
}

// Offline fallbacks (aligned with pi-ai's generated model catalog). Replaced
// by the live listing whenever credentials allow a fetch.
const CLAUDE_MODELS = ['claude-sonnet-4-6', 'claude-sonnet-5', 'claude-opus-4-6', 'claude-haiku-4-5'] as const;
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] as const;
const OPENAI_KEY_MODELS = ['gpt-4o', 'gpt-4o-mini', 'o3-mini'] as const;

const LIST_CACHE_TTL_MS = 5 * 60_000;
const modelListCache = new Map<string, { readonly models: readonly string[]; readonly checkedAt: number }>();

async function cachedList(key: string, fetcher: () => Promise<readonly string[]>): Promise<readonly string[] | null> {
  const cached = modelListCache.get(key);
  if (cached && Date.now() - cached.checkedAt < LIST_CACHE_TTL_MS) return cached.models;
  try {
    const models = await fetcher();
    if (models.length > 0) {
      modelListCache.set(key, { models, checkedAt: Date.now() });
      return models;
    }
  } catch {
    // Network/auth failure — fall back to the static catalog.
  }
  return null;
}

/** Live Anthropic catalog (works with subscription OAuth or API keys). */
async function fetchAnthropicModels(accessToken: string): Promise<readonly string[]> {
  const res = await fetch('https://api.anthropic.com/v1/models?limit=100', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'oauth-2025-04-20',
    },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`anthropic /v1/models: HTTP ${res.status}`);
  const data = await res.json() as { data?: Array<{ id?: string }> };
  return (data.data ?? []).map(m => m.id ?? '').filter(Boolean);
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readCodexSubscription(): Promise<{ accessToken: string; accountId: string } | null> {
  try {
    const raw = await readFile(join(homedir(), '.codex', 'auth.json'), 'utf-8');
    const parsed = JSON.parse(raw) as {
      tokens?: { access_token?: string; account_id?: string };
    };
    if (!parsed.tokens?.access_token) return null;
    return {
      accessToken: parsed.tokens.access_token,
      accountId: parsed.tokens.account_id ?? '',
    };
  } catch {
    return null;
  }
}

/** Codex CLI's own model catalog; empty until Codex CLI has run once. */
async function readCodexModels(): Promise<string[]> {
  try {
    return codexModelsFromCache(JSON.parse(await readFile(join(homedir(), '.codex', 'models_cache.json'), 'utf-8')));
  } catch {
    return [];
  }
}

async function readOmpInferxKey(): Promise<string> {
  try {
    const ompYml = await readFile(join(homedir(), '.omp', 'agent', 'models.yml'), 'utf-8');
    return ompYml.match(/apiKey:\s*([^\s\r\n]+)/)?.[1] ?? '';
  } catch {
    return '';
  }
}

async function listOllamaModels(): Promise<readonly string[] | null> {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return null;
    const data = await res.json() as { models?: Array<{ name?: string }> };
    return (data.models ?? []).map(m => m.name ?? '').filter(Boolean);
  } catch {
    return null;
  }
}

/** Fetches model list from any standard OpenAI-compatible /v1/models endpoint. */
async function fetchOpenAiModels(baseUrl: string, apiKey?: string): Promise<readonly string[] | null> {
  try {
    const clean = baseUrl.trim().replace(/\/+$/, '');
    const root = clean.endsWith('/chat/completions')
      ? clean.replace(/\/chat\/completions$/, '')
      : clean;
    const modelsUrl = root.endsWith('/v1') ? `${root}/models` : `${root}/v1/models`;
    const headers: Record<string, string> = {};
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    const res = await fetch(modelsUrl, { headers, signal: AbortSignal.timeout(2000) });
    if (!res.ok) return null;
    const data = await res.json() as { data?: Array<{ id?: string }>; models?: Array<{ id?: string; slug?: string }> };
    const list = (data.data ?? []).map(m => m.id ?? '')
      .concat((data.models ?? []).map(m => m.slug ?? m.id ?? ''))
      .filter(Boolean);
    return list.length > 0 ? [...new Set(list)] : null;
  } catch {
    return null;
  }
}

export async function detectModelSources(): Promise<readonly DesktopModelSource[]> {
  let savedOpenAiBase = '';
  try {
    const configFile = process.env['AIX_CONFIG_PATH'] || join(process.env['AIX_STORAGE_ROOT'] || homedir(), '.aix', 'ai-config.json');
    const raw = await readFile(configFile, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.provider === 'openai' && parsed.baseUrl) savedOpenAiBase = parsed.baseUrl;
  } catch {
    // Config file optional
  }
  const activeOpenAiBase = process.env['OPENAI_BASE_URL'] || process.env['AIX_API_URL'] || savedOpenAiBase;

  const [claude, codex, codexModels, customOpenAiModels, ollamaModels, ompKey] = await Promise.all([
    listClaudeCodeSubscription(),
    readCodexSubscription(),
    readCodexModels(),
    activeOpenAiBase ? fetchOpenAiModels(activeOpenAiBase, process.env['OPENAI_API_KEY']) : Promise.resolve(null),
    listOllamaModels(),
    readOmpInferxKey(),
  ]);
  const [hasAntigravity, hasGeminiCli, claudeLive] = await Promise.all([
    pathExists(join(homedir(), '.antigravity')),
    pathExists(join(homedir(), '.gemini')),
    // Live model listings — same pattern as pi/omp: refresh credentials, hit
    // the provider's model-list endpoint, fall back to the static catalog.
    (async (): Promise<readonly string[] | null> => {
      if (!claude?.detected) return null;
      try {
        const token = await ensureClaudeSubscriptionToken();
        return await cachedList('claude-code', () => fetchAnthropicModels(token));
      } catch {
        // Expired/invalid login — static catalog fallback, clear note in UI.
        return null;
      }
    })(),
  ]);

  const claudeModels = claudeLive ?? CLAUDE_MODELS;

  return [
    {
      id: 'claude-code',
      name: 'Claude Code',
      provider: 'anthropic',
      authNote: 'CLI subscription',
      detected: Boolean(claude?.detected),
      usable: claude?.detected ?? false,
      note: !claude?.detected
        ? 'Install Claude Code and run `claude /login`'
        : claude.status === 'expired'
          ? 'Login expired — run `claude /login` again, model list refreshes after login'
          : claudeLive
            ? `Subscription login detected — ${claudeLive.length} live models`
            : 'Subscription login detected',
      models: claudeModels,
    },
    {
      id: 'codex',
      name: 'Codex CLI',
      provider: 'codex',
      authNote: 'ChatGPT subscription',
      detected: Boolean(codex),
      usable: Boolean(codex),
      note: !codex
        ? 'Install Codex CLI and log in with your ChatGPT account'
        : codexModels.length > 0
          ? `ChatGPT-plan login detected — ${codexModels.length} Codex models`
          : 'ChatGPT-plan login detected — run Codex CLI once to load its model list',
      models: codexModels,
    },
    {
      id: 'antigravity',
      name: 'Antigravity (agy)',
      provider: 'anthropic',
      authNote: 'CLI detected',
      detected: hasAntigravity,
      usable: false,
      note: hasAntigravity
        ? 'CLI installed — direct calls not wired yet'
        : 'Not found on this machine',
      models: [],
    },
    {
      id: 'gemini',
      name: 'Gemini CLI',
      provider: 'anthropic',
      authNote: 'CLI detected',
      detected: hasGeminiCli,
      usable: false,
      note: hasGeminiCli
        ? 'CLI installed — direct calls not wired yet'
        : 'Not found on this machine',
      models: [],
    },
    {
      id: 'ollama',
      name: 'Ollama (local)',
      provider: 'ollama',
      authNote: 'Local server',
      detected: ollamaModels !== null,
      usable: ollamaModels !== null && ollamaModels.length > 0,
      note: ollamaModels === null
        ? 'Not running — start Ollama to use local models'
        : ollamaModels.length === 0
          ? 'Running, but no models pulled yet (ollama pull <model>)'
          : `Running locally — ${ollamaModels.length} model(s) installed`,
      models: ollamaModels ?? [],
    },
    {
      id: 'anthropic-key',
      name: 'Anthropic (API key)',
      provider: 'anthropic',
      authNote: 'Environment key',
      detected: Boolean(process.env['ANTHROPIC_API_KEY']),
      usable: Boolean(process.env['ANTHROPIC_API_KEY']),
      note: process.env['ANTHROPIC_API_KEY'] ? 'ANTHROPIC_API_KEY found in environment' : 'No ANTHROPIC_API_KEY in environment',
      models: CLAUDE_MODELS,
    },
    {
      id: 'openai-key',
      name: activeOpenAiBase ? 'OpenAI / Custom Gateway' : 'OpenAI (API key)',
      provider: 'openai',
      authNote: activeOpenAiBase
        ? (isLocalOrCustomEndpoint(activeOpenAiBase) ? 'Local gateway (key optional)' : 'Custom endpoint')
        : 'Environment key',
      detected: Boolean(activeOpenAiBase || process.env['OPENAI_API_KEY']),
      usable: Boolean((activeOpenAiBase && isLocalOrCustomEndpoint(activeOpenAiBase)) || process.env['OPENAI_API_KEY']),
      note: activeOpenAiBase
        ? `Endpoint: ${activeOpenAiBase}${customOpenAiModels ? ` — ${customOpenAiModels.length} models detected` : ''}`
        : (process.env['OPENAI_API_KEY'] ? 'OPENAI_API_KEY found in environment' : 'No OPENAI_API_KEY in environment'),
      models: (customOpenAiModels && customOpenAiModels.length > 0) ? customOpenAiModels : OPENAI_KEY_MODELS,
    },
    {
      id: 'groq-key',
      name: 'Groq (API key)',
      provider: 'groq',
      authNote: 'Environment key',
      detected: Boolean(process.env['GROQ_API_KEY']),
      usable: Boolean(process.env['GROQ_API_KEY']),
      note: process.env['GROQ_API_KEY'] ? 'GROQ_API_KEY found in environment' : 'No GROQ_API_KEY in environment',
      models: GROQ_MODELS,
    },
    {
      id: 'inferx-key',
      name: 'InferX DeepSeek',
      provider: 'inferx',
      authNote: 'Pre-configured',
      detected: Boolean(process.env['INFERX_API_KEY'] || ompKey),
      usable: Boolean(process.env['INFERX_API_KEY'] || ompKey),
      note: process.env['INFERX_API_KEY'] || ompKey ? 'Key found (environment or ~/.omp config)' : 'No InferX key configured',
      models: ['deepseek-v4.1-flash-1017-basic'],
    },
    {
      id: 'mock',
      name: 'Mock (offline test)',
      provider: 'mock',
      authNote: 'No auth',
      detected: true,
      usable: true,
      note: 'Placeholder provider for UI testing',
      models: ['mock-engine-v1'],
    },
  ];
}

/** Puts the credentials for the chosen source into the engine environment. */
export async function ensureSourceEnv(sourceId: DesktopModelSource['id']): Promise<void> {
  if (sourceId === 'claude-code') {
    await applyClaudeSubscriptionEnv();
    return;
  }
  if (sourceId === 'codex') {
    const codex = await readCodexSubscription();
    if (!codex) {
      throw new Error('Codex CLI login not found. Install Codex and log in with your ChatGPT account, then retry.');
    }
    process.env['AIX_OAUTH_TOKEN'] = codex.accessToken;
    process.env['AIX_OAUTH_ACCOUNT_ID'] = codex.accountId;
    return;
  }
  // Environment-key and local sources are already visible to the engine.
}

/** Best-effort existence check used for CLI detection UI (kept cheap). */
export function cliBinaryHint(name: string): boolean {
  const candidates: Record<string, string[]> = {
    claude: [join(homedir(), '.local', 'bin', 'claude')],
    codex: [],
    agy: [join(homedir(), '.local', 'bin', 'agy')],
  };
  return (candidates[name] ?? []).some(existsSync);
}
