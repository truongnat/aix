import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Neo4jService } from '../neo4j/neo4j.service.js';

const BCRYPT_ROUNDS = 10;
const KEY_PREFIX = 'kb_live_';
const KEY_TOTAL_LENGTH = 8 + 64; // prefix (kb_live_) + hex (randomBytes(32))

@Injectable()
export class AuthService {
  readonly #neo4j: Neo4jService;
  readonly #log = new Logger(AuthService.name);

  constructor(neo4j: Neo4jService) {
    this.#neo4j = neo4j;
  }

  async ensureSchema(): Promise<void> {
    const session = this.#neo4j.session();
    try {
      await session.run(`
        CREATE CONSTRAINT IF NOT EXISTS FOR (k:ApiKey) REQUIRE k.hashedKey IS UNIQUE
      `);
    } finally {
      await session.close();
    }
  }

  async generateKey(label: string): Promise<{ raw: string; hashed: string }> {
    const raw = KEY_PREFIX + randomBytes(32).toString('hex');
    const hashed = await bcrypt.hash(raw, BCRYPT_ROUNDS);
    const session = this.#neo4j.session();
    try {
      await session.run(
        `CREATE (k:ApiKey {hashedKey: $hashed, label: $label, createdAt: $createdAt})`,
        { hashed, label, createdAt: new Date().toISOString() },
      );
    } finally {
      await session.close();
    }
    return { raw, hashed };
  }

  async validateKey(raw: string): Promise<boolean> {
    if (typeof raw !== 'string') return false;
    if (!raw.startsWith(KEY_PREFIX) || raw.length !== KEY_TOTAL_LENGTH) return false;
    // TODO(V4-L1): add a non-secret key-id prefix to MATCH a single candidate,
    // then bcrypt.compare once, avoiding O(n) bcrypt per request.
    const session = this.#neo4j.session();
    try {
      const result = await session.run(`MATCH (k:ApiKey) RETURN k.hashedKey AS hashedKey`);
      for (const record of result.records) {
        const hashed = record.get('hashedKey') as string;
        if (await bcrypt.compare(raw, hashed)) return true;
      }
      return false;
    } finally {
      await session.close();
    }
  }

  validateMasterPassword(pwd: string): boolean {
    const expected = process.env.KB_MASTER_PASSWORD;
    if (!expected) return false;
    if (pwd.length !== expected.length) return false;
    try {
      return timingSafeEqual(Buffer.from(pwd), Buffer.from(expected));
    } catch {
      return false;
    }
  }
}
