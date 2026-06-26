import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { EngineState } from './state.js';

export class CheckpointManager {
  readonly #dir: string;

  constructor(dir?: string) {
    this.#dir = dir ?? join(process.cwd(), '.aix', 'checkpoints');
  }

  async save(state: EngineState): Promise<string> {
    await mkdir(this.#dir, { recursive: true });
    const id = state.session.id;
    const path = join(this.#dir, `${id}.json`);
    await writeFile(path, JSON.stringify(state, null, 2), 'utf-8');
    return id;
  }

  async load(id: string): Promise<EngineState | undefined> {
    const path = join(this.#dir, `${id}.json`);
    if (!existsSync(path)) return undefined;
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as EngineState;
  }

  async list(): Promise<string[]> {
    try {
      const files = await readdir(this.#dir);
      return files.filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
    } catch {
      return [];
    }
  }
}
