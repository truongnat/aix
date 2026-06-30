import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { EngineState } from './state.js';

export const SESSIONS_ROOT = join(process.cwd(), '.aix', 'sessions');

export function sessionDir(sessionId: string): string {
  return join(SESSIONS_ROOT, sessionId);
}

export function sessionArtifactPath(sessionId: string, name: string): string {
  return join(sessionDir(sessionId), name);
}

export function sessionArchiveDir(sessionId: string): string {
  return join(sessionDir(sessionId), 'archive');
}

export function sessionGeneratedDir(sessionId: string): string {
  return join(sessionDir(sessionId), 'generated');
}

export function sessionStatePath(sessionId: string): string {
  return join(sessionDir(sessionId), 'state.json');
}

export class SessionStore {
  readonly #root: string;

  constructor(root?: string) {
    this.#root = root ?? SESSIONS_ROOT;
  }

  async save(state: EngineState): Promise<string> {
    const id = state.session.id;
    const dir = join(this.#root, id);
    await mkdir(dir, { recursive: true });
    const path = join(dir, 'state.json');
    await writeFile(path, JSON.stringify(state, null, 2), 'utf-8');
    return id;
  }

  async load(id: string): Promise<EngineState | undefined> {
    const path = join(this.#root, id, 'state.json');
    if (!existsSync(path)) return undefined;
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as EngineState;
  }

  async list(): Promise<string[]> {
    try {
      const entries = await readdir(this.#root);
      const dirs: string[] = [];
      for (const entry of entries) {
        const statePath = join(this.#root, entry, 'state.json');
        if (existsSync(statePath)) dirs.push(entry);
      }
      return dirs.sort();
    } catch {
      return [];
    }
  }
}
