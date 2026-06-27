import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import type { Neo4jRecord } from '../neo4j/neo4j.service.js';

const INDEX = 'memory';

/**
 * Meilisearch full-text index for memory records (ported from imports/dev-memory).
 * Best-effort: if Meili is unavailable, `search()` returns null so KbService falls
 * back to the Neo4j substring query, and `health()` reports the real state.
 */
@Injectable()
export class SearchService implements OnModuleInit {
  readonly #logger = new Logger(SearchService.name);
  readonly #client: MeiliSearch;
  #connected = false;

  constructor() {
    this.#client = new MeiliSearch({
      host: process.env.MEILI_HOST ?? 'http://localhost:7700',
      apiKey: process.env.MEILI_MASTER_KEY ?? '',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.#client.createIndex(INDEX, { primaryKey: 'id' }).catch(() => undefined);
      await this.#client.index(INDEX).updateSettings({
        searchableAttributes: ['title', 'body'],
        filterableAttributes: ['tags', 'kind'],
        sortableAttributes: ['createdAt'],
      });
      this.#connected = true;
      this.#logger.log('Meilisearch connected');
    } catch (err) {
      this.#connected = false;
      this.#logger.warn(`Meilisearch unavailable: ${(err as Error).message}`);
    }
  }

  get connected(): boolean {
    return this.#connected;
  }

  async health(): Promise<boolean> {
    try {
      const h = await this.#client.health();
      this.#connected = h.status === 'available';
      return this.#connected;
    } catch {
      this.#connected = false;
      return false;
    }
  }

  async index(rec: Neo4jRecord): Promise<void> {
    if (!this.#connected) return;
    try {
      await this.#client.index(INDEX).addDocuments([{ ...rec, tags: [...rec.tags] }]);
    } catch (err) {
      this.#logger.debug(`index failed: ${(err as Error).message}`);
    }
  }

  async remove(id: string): Promise<void> {
    if (!this.#connected) return;
    try {
      await this.#client.index(INDEX).deleteDocument(id);
    } catch (err) {
      this.#logger.debug(`delete failed: ${(err as Error).message}`);
    }
  }

  /** Returns hits, or null when Meili is unavailable (caller should fall back). */
  async search(query: string, k = 10): Promise<Neo4jRecord[] | null> {
    if (!this.#connected) return null;
    try {
      const res = await this.#client.index(INDEX).search(query, { limit: k });
      return res.hits as unknown as Neo4jRecord[];
    } catch (err) {
      this.#logger.debug(`search failed: ${(err as Error).message}`);
      return null;
    }
  }
}
