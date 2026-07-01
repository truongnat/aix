import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { join } from 'node:path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;
const KEY_PREFIX = 'kb_live_';
const KEY_TOTAL_LENGTH = 8 + 64; // prefix (kb_live_) + hex (randomBytes(32))

interface StoredKey {
  hashedKey: string;
  label: string;
  createdAt: string;
}

/**
 * File-backed auth for local kb-server.
 * API keys are bcrypt-hashed and stored in KB_DATA_DIR/api-keys.json.
 * No external DB required.
 */
@Injectable()
export class AuthService {
  readonly #logger = new Logger(AuthService.name);
  readonly #keysFile: string;

  constructor() {
    const dataDir = process.env.KB_DATA_DIR ?? join(process.env.HOME ?? process.env.USERPROFILE ?? '.', '.aix', 'kb');
    mkdirSync(dataDir, { recursive: true });
    this.#keysFile = join(dataDir, 'api-keys.json');
    if (!existsSync(this.#keysFile)) {
      writeFileSync(this.#keysFile, JSON.stringify([]), 'utf-8');
    }
    this.#logger.log(`API keys at ${this.#keysFile}`);
  }

  /** No-op: schema ensured in constructor. */
  async ensureSchema(): Promise<void> {}

  #readKeys(): StoredKey[] {
    try {
      return JSON.parse(readFileSync(this.#keysFile, 'utf-8')) as StoredKey[];
    } catch {
      return [];
    }
  }

  #writeKeys(keys: StoredKey[]): void {
    writeFileSync(this.#keysFile, JSON.stringify(keys, null, 2), 'utf-8');
  }

  async generateKey(label: string): Promise<{ raw: string; hashed: string }> {
    const raw = KEY_PREFIX + randomBytes(32).toString('hex');
    const hashed = await bcrypt.hash(raw, BCRYPT_ROUNDS);
    const keys = this.#readKeys();
    keys.push({ hashedKey: hashed, label, createdAt: new Date().toISOString() });
    this.#writeKeys(keys);
    return { raw, hashed };
  }

  async validateKey(raw: string): Promise<boolean> {
    if (typeof raw !== 'string') return false;
    if (!raw.startsWith(KEY_PREFIX) || raw.length !== KEY_TOTAL_LENGTH) return false;
    const keys = this.#readKeys();
    for (const entry of keys) {
      if (await bcrypt.compare(raw, entry.hashedKey)) return true;
    }
    return false;
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
