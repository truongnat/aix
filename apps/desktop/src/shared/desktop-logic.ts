import type { DesktopAiConfig, DesktopModelSource } from './api.js';

export interface DesktopRuntimeConfig {
  readonly provider: string;
  readonly model: string;
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly useSubscription?: boolean;
}

export function sessionTitleFromTask(task: string): string {
  const firstLine = task.trim().split(/\r?\n/, 1)[0] ?? '';
  const title = firstLine.replace(/\s+/g, ' ');
  return title.length > 96 ? `${title.slice(0, 95).trimEnd()}…` : title;
}

export function isCurrentSpineSession(activeSessionId: string, eventSessionId: string): boolean {
  return activeSessionId.length > 0 && activeSessionId === eventSessionId;
}

/**
 * Custom endpoints apply only to key-based providers. Subscription logins
 * (Claude Code OAuth, Codex) always use their own host, so a stale override
 * left over from another provider can never receive their token.
 */
export function endpointOverrideFor(config: Pick<DesktopRuntimeConfig, 'provider' | 'baseUrl' | 'useSubscription'>): string | undefined {
  if (config.useSubscription || config.provider === 'codex') return undefined;
  return config.baseUrl?.trim() || undefined;
}

/** Checks if a URL points to localhost or private network where auth is typically optional. */
export function isLocalOrCustomEndpoint(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0' || hostname.endsWith('.local');
  } catch {
    return false;
  }
}

export function hasModelCredentials(
  config: Pick<DesktopAiConfig, 'provider' | 'hasApiKey' | 'useSubscription' | 'baseUrl'>,
  sources: readonly Pick<DesktopModelSource, 'provider' | 'usable'>[] = [],
): boolean {
  if (config.provider === 'mock') return true;
  if (config.provider === 'codex' || config.provider === 'ollama') {
    return sources.some(source => source.provider === config.provider && source.usable);
  }
  if (config.hasApiKey || (config.provider === 'anthropic' && config.useSubscription)) return true;
  return config.provider === 'openai' && Boolean(config.baseUrl && isLocalOrCustomEndpoint(config.baseUrl));
}

/** Normalizes any base URL to an OpenAI-compatible /chat/completions endpoint. */
export function normalizeCompletionsUrl(url: string): string {
  const clean = url.trim().replace(/\/+$/, '');
  if (clean.endsWith('/chat/completions')) return clean;
  if (clean.endsWith('/v1')) return `${clean}/chat/completions`;
  return `${clean}/v1/chat/completions`;
}

export function providerEnvironmentFor(config: DesktopRuntimeConfig): Record<string, string> {
  const environment: Record<string, string> = {
    AIX_PROVIDER: config.provider,
    AIX_MODEL: config.model,
  };
  if (config.apiKey) environment['AIX_API_KEY'] = config.apiKey;
  const endpoint = endpointOverrideFor(config);
  if (endpoint) environment['AIX_API_URL'] = endpoint;
  return environment;
}

/**
 * Models a ChatGPT-account Codex login accepts, read from Codex CLI's own
 * `~/.codex/models_cache.json`. Hidden entries and `provider/model` slugs
 * (added by local proxies such as magpie) are not callable on ChatGPT.
 */
export function codexModelsFromCache(cache: unknown): string[] {
  const models = (cache as { models?: unknown } | null)?.models;
  if (!Array.isArray(models)) return [];
  return models
    .filter((m): m is { slug: string; visibility?: string; priority?: number } =>
      typeof m?.slug === 'string' && m.visibility === 'list' && !m.slug.includes('/'))
    .sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER))
    .map((m) => m.slug);
}
