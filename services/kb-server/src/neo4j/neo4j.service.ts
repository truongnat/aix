import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';

export interface Neo4jRecord {
  readonly id: string;
  readonly kind: string;
  readonly title: string;
  readonly body: string;
  readonly tags: readonly string[];
  readonly version: string;
  readonly createdAt: string;
}

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  readonly #driver: Driver;

  constructor() {
    const uri = process.env.NEO4J_URI ?? 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER ?? 'neo4j';
    const pass = process.env.NEO4J_PASSWORD ?? 'password';
    this.#driver = neo4j.driver(uri, neo4j.auth.basic(user, pass));
  }

  get driver(): Driver {
    return this.#driver;
  }

  async health(): Promise<boolean> {
    try {
      await this.#driver.getServerInfo();
      return true;
    } catch {
      return false;
    }
  }

  // v1 scope: single flat Memory node (CRUD via substring search).
  // §7.2 graph model (Solution, Skill, Tag, Project nodes + relationships)
  // deferred to v2.
  async ensureSchema(): Promise<void> {
    const session = this.#driver.session();
    try {
      await session.run(`
        CREATE CONSTRAINT IF NOT EXISTS FOR (m:Memory) REQUIRE m.id IS UNIQUE
      `);
    } finally {
      await session.close();
    }
  }

  session(): Session {
    return this.#driver.session();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.#driver.close();
  }
}
