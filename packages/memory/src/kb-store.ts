import type { MemoryRecord, MemoryStore } from './types.js';
import { MarkdownStore } from './markdown-store.js';

export const KB_API_VERSION = 'v1';

let degradeLogged = false;

function logDegrade(): void {
  if (!degradeLogged) {
    console.warn('[kb] server unreachable — falling back to markdown storage');
    degradeLogged = true;
  }
}

function baseUrl(serverUrl: string): string {
  return `${serverUrl.replace(/\/+$/, '')}/api/${KB_API_VERSION}`;
}
interface KbCredentials {
  readonly apiKey?: string;
  readonly masterPassword?: string;
}

class KbAuthorizationError extends Error {
  constructor(status: number) {
    super(`[kb] authorization failed (HTTP ${status}); check KB_API_KEY or KB_MASTER_PASSWORD`);
    this.name = 'KbAuthorizationError';
  }
}

function checkAuthorization(res: Response): void {
  if (res.status === 401 || res.status === 403) throw new KbAuthorizationError(res.status);
}

export class KbStore implements MemoryStore {
  readonly #serverUrl: string;
  readonly #fallback: MarkdownStore;
  readonly #headers: Record<string, string>;
  #degrade: boolean;

  constructor(serverUrl: string, fallbackBaseDir?: string, credentials: KbCredentials = {}) {
    this.#serverUrl = serverUrl;
    this.#fallback = new MarkdownStore(fallbackBaseDir ?? '.');
    this.#degrade = false;
    this.#headers = credentials.apiKey
      ? { 'x-api-key': credentials.apiKey }
      : credentials.masterPassword
        ? { 'x-master-password': credentials.masterPassword }
        : {};
  }

  async push(rec: MemoryRecord): Promise<void> {
    if (this.#degrade) {
      logDegrade();
      await this.#fallback.push(rec);
      return;
    }
    try {
      const res = await fetch(`${baseUrl(this.#serverUrl)}/memory`, {
        method: 'POST',
        headers: { ...this.#headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(rec),
      });
      checkAuthorization(res);
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
    } catch (error) {
      if (error instanceof KbAuthorizationError) throw error;
      this.#degrade = true;
      logDegrade();
      await this.#fallback.push(rec);
    }
  }

  async search(query: string, opts?: { tags?: readonly string[]; k?: number }): Promise<readonly MemoryRecord[]> {
    if (this.#degrade) {
      logDegrade();
      return this.#fallback.search(query, opts);
    }
    try {
      const params = new URLSearchParams({ q: query });
      if (opts?.k) params.set('k', String(opts.k));
      if (opts?.tags) params.set('tags', opts.tags.join(','));
      const res = await fetch(`${baseUrl(this.#serverUrl)}/memory/search?${params}`, { headers: this.#headers });
      checkAuthorization(res);
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      return await res.json() as MemoryRecord[];
    } catch (error) {
      if (error instanceof KbAuthorizationError) throw error;
      this.#degrade = true;
      logDegrade();
      return this.#fallback.search(query, opts);
    }
  }

  async get(id: string): Promise<MemoryRecord | undefined> {
    if (this.#degrade) {
      logDegrade();
      return this.#fallback.get(id);
    }
    try {
      const res = await fetch(`${baseUrl(this.#serverUrl)}/memory/${encodeURIComponent(id)}`, { headers: this.#headers });
      checkAuthorization(res);
      if (res.status === 404) return undefined;
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      return await res.json() as MemoryRecord;
    } catch (error) {
      if (error instanceof KbAuthorizationError) throw error;
      this.#degrade = true;
      logDegrade();
      return this.#fallback.get(id);
    }
  }

  async list(opts?: { kind?: MemoryRecord['kind'] }): Promise<readonly MemoryRecord[]> {
    if (this.#degrade) {
      logDegrade();
      return this.#fallback.list(opts);
    }
    try {
      const params = new URLSearchParams();
      if (opts?.kind) params.set('kind', opts.kind);
      const res = await fetch(`${baseUrl(this.#serverUrl)}/memory?${params}`, { headers: this.#headers });
      checkAuthorization(res);
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      return await res.json() as MemoryRecord[];
    } catch (error) {
      if (error instanceof KbAuthorizationError) throw error;
      this.#degrade = true;
      logDegrade();
      return this.#fallback.list(opts);
    }
  }
}
