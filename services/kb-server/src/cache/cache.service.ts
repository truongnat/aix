import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Redis-backed cache (ported from imports/dev-memory). Best-effort: if Redis is
 * unavailable the server keeps serving from Neo4j, and `health()` reports the
 * real connection state so `/health` and `aix doctor` stay honest.
 */
@Injectable()
export class CacheService implements OnApplicationShutdown {
  readonly #logger = new Logger(CacheService.name);
  readonly #client: Redis;
  #connected = false;

  constructor() {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    this.#client = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      // Give up after a few attempts so a missing Redis does not spam logs.
      retryStrategy: times => (times > 5 ? null : Math.min(times * 200, 2000)),
    });
    this.#client.on('connect', () => {
      this.#connected = true;
      this.#logger.log('Redis connected');
    });
    this.#client.on('error', (err: Error) => {
      this.#connected = false;
      this.#logger.warn(`Redis error: ${err.message}`);
    });
  }

  get connected(): boolean {
    return this.#connected;
  }

  async health(): Promise<boolean> {
    try {
      const pong = await this.#client.ping();
      this.#connected = pong === 'PONG';
      return this.#connected;
    } catch {
      this.#connected = false;
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.#connected) return null;
    try {
      const val = await this.#client.get(key);
      return val ? (JSON.parse(val) as T) : null;
    } catch (err) {
      this.#logger.debug(`cache get failed: ${(err as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.#connected) return;
    try {
      await this.#client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      this.#logger.debug(`cache set failed: ${(err as Error).message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.#connected) return;
    try {
      await this.#client.del(key);
    } catch (err) {
      this.#logger.debug(`cache del failed: ${(err as Error).message}`);
    }
  }

  /** Delete all keys matching a glob pattern, scanning in batches to avoid blocking. */
  async delByPattern(pattern: string): Promise<void> {
    if (!this.#connected) return;
    try {
      let cursor = '0';
      do {
        const [next, keys] = await this.#client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = next;
        if (keys.length > 0) await this.#client.del(...keys);
      } while (cursor !== '0');
    } catch (err) {
      this.#logger.debug(`cache delByPattern failed: ${(err as Error).message}`);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    try {
      await this.#client.quit();
    } catch {
      this.#client.disconnect();
    }
  }
}
