import { Injectable } from '@nestjs/common';
import neo4j from 'neo4j-driver';
import { Neo4jService, type Neo4jRecord } from '../neo4j/neo4j.service.js';
import { SearchService } from '../search/search.service.js';
import { CacheService } from '../cache/cache.service.js';

const SEARCH_PREFIX = 'kb:search:';
const GET_PREFIX = 'kb:get:';

function toRecord(properties: Record<string, unknown>): Neo4jRecord {
  const tags = properties.tags;
  return {
    id: String(properties.id ?? ''),
    kind: String(properties.kind ?? ''),
    title: String(properties.title ?? ''),
    body: String(properties.body ?? ''),
    tags: Array.isArray(tags) ? tags.map(String) : typeof tags === 'string' ? tags.split(',').filter(Boolean) : [],
    version: String(properties.version ?? ''),
    createdAt: String(properties.createdAt ?? ''),
  };
}

@Injectable()
export class KbService {
  readonly #neo4j: Neo4jService;
  readonly #search: SearchService;
  readonly #cache: CacheService;

  constructor(neo4jSvc: Neo4jService, search: SearchService, cache: CacheService) {
    this.#neo4j = neo4jSvc;
    this.#search = search;
    this.#cache = cache;
  }

  async push(rec: Neo4jRecord): Promise<void> {
    const session = this.#neo4j.session();
    try {
      await session.run(
        `MERGE (m:Memory {id: $id})
         SET m.kind = $kind,
             m.title = $title,
             m.body = $body,
             m.tags = $tags,
             m.version = $version,
             m.createdAt = $createdAt`,
        { ...rec, tags: [...rec.tags] },
      );
    } finally {
      await session.close();
    }
    // Mirror into the search index and invalidate stale caches.
    await this.#search.index(rec);
    await this.#cache.delByPattern(`${SEARCH_PREFIX}*`);
    await this.#cache.del(`${GET_PREFIX}${rec.id}`);
  }

  async search(query: string, k = 10): Promise<Neo4jRecord[]> {
    const cacheKey = `${SEARCH_PREFIX}${k}:${query}`;
    const cached = await this.#cache.get<Neo4jRecord[]>(cacheKey);
    if (cached) return cached;

    // Prefer Meilisearch full-text; fall back to Neo4j substring when unavailable.
    const fromMeili = await this.#search.search(query, k);
    const results = fromMeili ?? (await this.#searchNeo4j(query, k));
    await this.#cache.set(cacheKey, results);
    return results;
  }

  async #searchNeo4j(query: string, k: number): Promise<Neo4jRecord[]> {
    const session = this.#neo4j.session();
    try {
      const result = await session.run(
        `MATCH (m:Memory)
         WHERE m.title CONTAINS $query OR m.body CONTAINS $query
         RETURN m
         LIMIT $k`,
        { query, k: neo4j.int(k) },
      );
      return result.records.map(r => toRecord((r.get('m') as Record<string, unknown>).properties as Record<string, unknown>));
    } finally {
      await session.close();
    }
  }

  async get(id: string): Promise<Neo4jRecord | null> {
    const cacheKey = `${GET_PREFIX}${id}`;
    const cached = await this.#cache.get<Neo4jRecord>(cacheKey);
    if (cached) return cached;

    const session = this.#neo4j.session();
    try {
      const result = await session.run(
        `MATCH (m:Memory {id: $id}) RETURN m`,
        { id },
      );
      if (result.records.length === 0) return null;
      const rec = toRecord((result.records[0]!.get('m') as Record<string, unknown>).properties as Record<string, unknown>);
      await this.#cache.set(cacheKey, rec);
      return rec;
    } finally {
      await session.close();
    }
  }

  async list(kind?: string): Promise<Neo4jRecord[]> {
    const session = this.#neo4j.session();
    try {
      const query = kind
        ? `MATCH (m:Memory {kind: $kind}) RETURN m ORDER BY m.createdAt DESC`
        : `MATCH (m:Memory) RETURN m ORDER BY m.createdAt DESC`;
      const result = await session.run(query, { kind });
      return result.records.map(r => toRecord((r.get('m') as Record<string, unknown>).properties as Record<string, unknown>));
    } finally {
      await session.close();
    }
  }
}
