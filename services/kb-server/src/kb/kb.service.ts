import { Injectable } from '@nestjs/common';
import { SqliteService, type KbRecord } from '../sqlite/sqlite.service.js';
import { CacheService } from '../cache/cache.service.js';

const SEARCH_PREFIX = 'kb:search:';
const GET_PREFIX = 'kb:get:';

@Injectable()
export class KbService {
  readonly #sqlite: SqliteService;
  readonly #cache: CacheService;

  constructor(sqlite: SqliteService, cache: CacheService) {
    this.#sqlite = sqlite;
    this.#cache = cache;
  }

  async push(rec: KbRecord): Promise<void> {
    this.#sqlite.upsert(rec);
    // Invalidate stale caches
    await this.#cache.delByPattern(`${SEARCH_PREFIX}*`);
    await this.#cache.del(`${GET_PREFIX}${rec.id}`);
  }

  async search(query: string, k = 10): Promise<KbRecord[]> {
    const cacheKey = `${SEARCH_PREFIX}${k}:${query}`;
    const cached = await this.#cache.get<KbRecord[]>(cacheKey);
    if (cached) return cached;

    const results = this.#sqlite.search(query, k);
    await this.#cache.set(cacheKey, results);
    return results;
  }

  async get(id: string): Promise<KbRecord | null> {
    const cacheKey = `${GET_PREFIX}${id}`;
    const cached = await this.#cache.get<KbRecord>(cacheKey);
    if (cached) return cached;

    const rec = this.#sqlite.getById(id);
    if (rec) await this.#cache.set(cacheKey, rec);
    return rec;
  }

  async list(kind?: string): Promise<KbRecord[]> {
    return this.#sqlite.list(kind);
  }
}
