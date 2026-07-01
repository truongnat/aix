import { Injectable, Logger } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

export interface KbRecord {
  readonly id: string;
  readonly kind: string;
  readonly title: string;
  readonly body: string;
  readonly tags: readonly string[];
  readonly version: string;
  readonly createdAt: string;
}

interface RawRow {
  id: string;
  kind: string;
  title: string;
  body: string;
  tags: string;
  version: string;
  created_at: string;
}

function toRecord(row: RawRow): KbRecord {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
    version: row.version,
    createdAt: row.created_at,
  };
}

/**
 * SQLite-backed storage using Node.js 22+ built-in node:sqlite.
 * No native compilation required. Uses FTS5 for full-text search.
 * Data stored at KB_DATA_DIR (default: ~/.aix/kb/memory.db).
 */
@Injectable()
export class SqliteService {
  readonly #logger = new Logger(SqliteService.name);
  readonly #db: DatabaseSync;

  constructor() {
    const dataDir = process.env.KB_DATA_DIR
      ?? join(process.env.HOME ?? process.env.USERPROFILE ?? '.', '.aix', 'kb');
    mkdirSync(dataDir, { recursive: true });
    const dbPath = join(dataDir, 'memory.db');
    this.#db = new DatabaseSync(dbPath);
    this.#logger.log(`SQLite DB at ${dbPath}`);
    this.#ensureSchema();
  }

  #ensureSchema(): void {
    this.#db.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA synchronous=NORMAL;

      CREATE TABLE IF NOT EXISTS memory (
        id          TEXT PRIMARY KEY,
        kind        TEXT NOT NULL DEFAULT '',
        title       TEXT NOT NULL DEFAULT '',
        body        TEXT NOT NULL DEFAULT '',
        tags        TEXT NOT NULL DEFAULT '',
        version     TEXT NOT NULL DEFAULT '',
        created_at  TEXT NOT NULL DEFAULT ''
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS memory_fts USING fts5(
        id UNINDEXED,
        title,
        body,
        content='memory',
        content_rowid='rowid'
      );

      CREATE TRIGGER IF NOT EXISTS memory_ai AFTER INSERT ON memory BEGIN
        INSERT INTO memory_fts(rowid, id, title, body) VALUES (new.rowid, new.id, new.title, new.body);
      END;

      CREATE TRIGGER IF NOT EXISTS memory_au AFTER UPDATE ON memory BEGIN
        INSERT INTO memory_fts(memory_fts, rowid, id, title, body) VALUES ('delete', old.rowid, old.id, old.title, old.body);
        INSERT INTO memory_fts(rowid, id, title, body) VALUES (new.rowid, new.id, new.title, new.body);
      END;

      CREATE TRIGGER IF NOT EXISTS memory_ad AFTER DELETE ON memory BEGIN
        INSERT INTO memory_fts(memory_fts, rowid, id, title, body) VALUES ('delete', old.rowid, old.id, old.title, old.body);
      END;
    `);
  }

  upsert(rec: KbRecord): void {
    const tagsStr = [...rec.tags].join(',');
    this.#db.prepare(`
      INSERT INTO memory (id, kind, title, body, tags, version, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        kind = excluded.kind,
        title = excluded.title,
        body = excluded.body,
        tags = excluded.tags,
        version = excluded.version,
        created_at = excluded.created_at
    `).run(rec.id, rec.kind, rec.title, rec.body, tagsStr, rec.version, rec.createdAt);
  }

  search(query: string, k = 10): KbRecord[] {
    try {
      const rows = this.#db.prepare(`
        SELECT m.* FROM memory m
        JOIN memory_fts fts ON fts.id = m.id
        WHERE memory_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `).all(query, k) as unknown as RawRow[];
      return rows.map(toRecord);
    } catch {
      // FTS match syntax error fallback to LIKE
      const rows = this.#db.prepare(`
        SELECT * FROM memory
        WHERE title LIKE ? OR body LIKE ?
        LIMIT ?
      `).all(`%${query}%`, `%${query}%`, k) as unknown as RawRow[];
      return rows.map(toRecord);
    }
  }

  getById(id: string): KbRecord | null {
    const row = this.#db.prepare(`SELECT * FROM memory WHERE id = ?`).get(id) as unknown as RawRow | undefined;
    return row ? toRecord(row) : null;
  }

  list(kind?: string): KbRecord[] {
    const rows = (kind
      ? this.#db.prepare(`SELECT * FROM memory WHERE kind = ? ORDER BY created_at DESC`).all(kind)
      : this.#db.prepare(`SELECT * FROM memory ORDER BY created_at DESC`).all()) as unknown as RawRow[];
    return rows.map(toRecord);
  }

  health(): Promise<boolean> {
    try {
      this.#db.prepare('SELECT 1').get();
      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  }

  onApplicationShutdown(): void {
    this.#db.close();
  }
}
