import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/master.guard.js';
import { SqliteService } from './sqlite/sqlite.service.js';
import { CacheService } from './cache/cache.service.js';

interface HealthReport {
  readonly status: string;
  readonly sqlite: boolean;
  readonly cache: boolean;
}

@Controller()
export class AppController {
  readonly #sqlite: SqliteService;
  readonly #cache: CacheService;

  constructor(sqlite: SqliteService, cache: CacheService) {
    this.#sqlite = sqlite;
    this.#cache = cache;
  }

  @Public()
  @Get('health')
  async health(): Promise<HealthReport> {
    const [sqlite, cache] = await Promise.all([
      this.#sqlite.health(),
      this.#cache.health(),
    ]);
    return { status: sqlite && cache ? 'ok' : 'degraded', sqlite, cache };
  }
}
