import { Injectable } from '@nestjs/common';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

/**
 * In-memory LRU-style cache replacing Redis for local use.
 * TTL is enforced lazily on read. Max 1000 entries; oldest evicted first.
 */
@Injectable()
export class CacheService {
  readonly #store = new Map<string, CacheEntry>();
  readonly #MAX = 1000;

  health(): Promise<boolean> {
    return Promise.resolve(true);
  }

  get connected(): boolean {
    return true;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.#store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.#store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (this.#store.size >= this.#MAX) {
      // evict oldest entry
      const oldest = this.#store.keys().next().value;
      if (oldest !== undefined) this.#store.delete(oldest);
    }
    this.#store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    this.#store.delete(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    // Convert glob pattern (e.g. "kb:search:*") to regex
    const regex = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    for (const key of this.#store.keys()) {
      if (regex.test(key)) this.#store.delete(key);
    }
  }
}
