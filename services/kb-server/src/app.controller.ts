import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/master.guard.js';
import { Neo4jService } from './neo4j/neo4j.service.js';
import { CacheService } from './cache/cache.service.js';
import { SearchService } from './search/search.service.js';

interface HealthReport {
  readonly status: string;
  readonly neo4j: boolean;
  readonly redis: boolean;
  readonly meili: boolean;
}

@Controller()
export class AppController {
  readonly #neo4j: Neo4jService;
  readonly #cache: CacheService;
  readonly #search: SearchService;

  constructor(neo4j: Neo4jService, cache: CacheService, search: SearchService) {
    this.#neo4j = neo4j;
    this.#cache = cache;
    this.#search = search;
  }

  @Public()
  @Get('health')
  async health(): Promise<HealthReport> {
    const [neo4j, redis, meili] = await Promise.all([
      this.#neo4j.health(),
      this.#cache.health(),
      this.#search.health(),
    ]);
    const ok = neo4j && redis && meili;
    return { status: ok ? 'ok' : 'degraded', neo4j, redis, meili };
  }
}
