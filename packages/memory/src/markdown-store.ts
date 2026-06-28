import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { MemoryRecord, MemoryStore } from './types.js';

const MEMORY_DIR = '.aix/runtime/memory';

function recordToMarkdown(rec: MemoryRecord): string {
  return [
    '---',
    `id: ${rec.id}`,
    `kind: ${rec.kind}`,
    `title: ${rec.title}`,
    `tags: [${rec.tags.join(', ')}]`,
    `version: ${rec.version}`,
    `createdAt: ${rec.createdAt}`,
    '---',
    '',
    rec.body,
  ].join('\n');
}

function parseMarkdownRecord(content: string): MemoryRecord {
  const lines = content.split('\n');
  const meta: Record<string, string> = {};
  let bodyStart = 0;

  if (lines[0]?.trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.trim() === '---') {
        bodyStart = i + 1;
        break;
      }
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        meta[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim();
      }
    }
  }

  const body = lines.slice(bodyStart).join('\n').trim();
  const tagsRaw = meta['tags'] ?? '[]';
  const tags = tagsRaw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  return {
    id: meta['id'] ?? '',
    kind: (meta['kind'] ?? 'evidence') as MemoryRecord['kind'],
    title: meta['title'] ?? '',
    body,
    tags,
    version: meta['version'] ?? '0.1.0',
    createdAt: meta['createdAt'] ?? new Date().toISOString(),
  };
}

function recordFilePath(id: string): string {
  return join(MEMORY_DIR, `${id}.md`);
}

export class MarkdownStore implements MemoryStore {
  readonly #baseDir: string;

  constructor(baseDir: string = '.') {
    this.#baseDir = baseDir;
  }

  async push(rec: MemoryRecord): Promise<void> {
    const dir = join(this.#baseDir, MEMORY_DIR);
    await mkdir(dir, { recursive: true });
    const content = recordToMarkdown(rec);
    await writeFile(join(dir, `${rec.id}.md`), content, 'utf-8');
  }

  async search(query: string, opts?: { tags?: readonly string[]; k?: number }): Promise<readonly MemoryRecord[]> {
    const dir = join(this.#baseDir, MEMORY_DIR);
    let files: string[];
    try {
      files = await readdir(dir);
    } catch {
      return [];
    }

    const q = query.toLowerCase();
    const results: MemoryRecord[] = [];

    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      try {
        const content = await readFile(join(dir, file), 'utf-8');
        const rec = parseMarkdownRecord(content);
        const searchable = `${rec.title} ${rec.body}`.toLowerCase();
        if (!searchable.includes(q)) continue;
        if (opts?.tags && opts.tags.length > 0) {
          const hasAllTags = opts.tags.every(t => rec.tags.includes(t));
          if (!hasAllTags) continue;
        }
        results.push(rec);
      } catch {
        continue;
      }
    }

    const limit = opts?.k ?? results.length;
    return results.slice(0, limit);
  }

  async get(id: string): Promise<MemoryRecord | undefined> {
    const filePath = recordFilePath(id);
    try {
      const content = await readFile(join(this.#baseDir, filePath), 'utf-8');
      return parseMarkdownRecord(content);
    } catch {
      return undefined;
    }
  }

  async list(opts?: { kind?: MemoryRecord['kind'] }): Promise<readonly MemoryRecord[]> {
    const dir = join(this.#baseDir, MEMORY_DIR);
    let files: string[];
    try {
      files = await readdir(dir);
    } catch {
      return [];
    }

    const results: MemoryRecord[] = [];
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      try {
        const content = await readFile(join(dir, file), 'utf-8');
        const rec = parseMarkdownRecord(content);
        if (opts?.kind && rec.kind !== opts.kind) continue;
        results.push(rec);
      } catch {
        continue;
      }
    }

    return results;
  }
}
