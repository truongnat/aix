import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { redact } from '@x/policy';
import type { EngineState } from './state.js';
import { redactEngineState } from './persistence-redaction.js';

export const SESSIONS_ROOT = join(process.cwd(), '.aix', 'sessions');

function configuredSessionsRoot(): string {
  return process.env['AIX_SESSIONS_ROOT'] ?? SESSIONS_ROOT;
}

function assertSessionId(id: string): void {
  if (redact(id).findings.some(finding => finding.type === 'secret')) {
    throw new Error('Session ID contains a recognized secret');
  }
}

export function sessionDir(sessionId: string): string {
  assertSessionId(sessionId);
  return join(configuredSessionsRoot(), sessionId);
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
    this.#root = root ?? configuredSessionsRoot();
  }

  async save(state: EngineState): Promise<string> {
    const clean = redactEngineState(state);
    const id = clean.session.id;
    const dir = join(this.#root, id);
    await mkdir(dir, { recursive: true });
    const path = join(dir, 'state.json');
    await writeFile(path, JSON.stringify(clean, null, 2), 'utf-8');
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
