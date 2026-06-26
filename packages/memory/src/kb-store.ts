import type { MemoryRecord, MemoryStore } from './types.js';
import { AppErrorClass } from '@x/core';

export const KB_API_VERSION = 'v1';

function baseUrl(serverUrl: string): string {
  return `${serverUrl.replace(/\/+$/, '')}/api/${KB_API_VERSION}`;
}

export class KbStore implements MemoryStore {
  readonly #serverUrl: string;

  constructor(serverUrl: string) {
    this.#serverUrl = serverUrl;
  }

  async push(rec: MemoryRecord): Promise<void> {
    const res = await fetch(`${baseUrl(this.#serverUrl)}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rec),
    });
    if (!res.ok) {
      throw new AppErrorClass({
        code: 'IO',
        message: `KbStore push failed: ${res.status} ${res.statusText}`,
        path: rec.id,
      });
    }
  }

  async search(query: string, opts?: { tags?: readonly string[]; k?: number }): Promise<readonly MemoryRecord[]> {
    const params = new URLSearchParams({ q: query });
    if (opts?.k) params.set('k', String(opts.k));
    if (opts?.tags) params.set('tags', opts.tags.join(','));

    const res = await fetch(`${baseUrl(this.#serverUrl)}/memory/search?${params}`);
    if (!res.ok) {
      throw new AppErrorClass({
        code: 'IO',
        message: `KbStore search failed: ${res.status} ${res.statusText}`,
      });
    }
    const data = await res.json() as MemoryRecord[];
    return data;
  }

  async get(id: string): Promise<MemoryRecord | undefined> {
    const res = await fetch(`${baseUrl(this.#serverUrl)}/memory/${encodeURIComponent(id)}`);
    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new AppErrorClass({
        code: 'IO',
        message: `KbStore get failed: ${res.status} ${res.statusText}`,
        path: id,
      });
    }
    const data = await res.json() as MemoryRecord;
    return data;
  }

  async list(opts?: { kind?: MemoryRecord['kind'] }): Promise<readonly MemoryRecord[]> {
    const params = new URLSearchParams();
    if (opts?.kind) params.set('kind', opts.kind);

    const res = await fetch(`${baseUrl(this.#serverUrl)}/memory?${params}`);
    if (!res.ok) {
      throw new AppErrorClass({
        code: 'IO',
        message: `KbStore list failed: ${res.status} ${res.statusText}`,
      });
    }
    const data = await res.json() as MemoryRecord[];
    return data;
  }
}
