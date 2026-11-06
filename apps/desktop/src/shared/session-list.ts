import { readFile, readdir, stat, lstat, realpath } from 'node:fs/promises';
import { join, resolve, relative, isAbsolute } from 'node:path';
import type { DesktopSessionSummary } from './api.js';
import { sessionTitleFromTask } from './desktop-logic.js';

const ARTIFACTS = ['DISCUSSION.md', 'PLAN.md', 'REVIEW.md', 'VERIFY.md', 'REMEMBER.md'];

type StoredState = {
  session?: { task?: string; phase?: DesktopSessionSummary['phase'] };
  task?: string;
  phase?: DesktopSessionSummary['phase'];
};

/** Lists persisted sessions, including runs that have not produced an artifact yet. */
export async function listDesktopSessions(
  root: string,
  activeRuns?: ReadonlyMap<string, unknown>,
): Promise<DesktopSessionSummary[]> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const listed = await Promise.all(entries.filter(entry => entry.isDirectory()).map(async (entry): Promise<DesktopSessionSummary | null> => {
    const path = join(root, entry.name);
    try {
      const [files, directory] = await Promise.all([readdir(path), stat(path)]);
      const artifacts = ARTIFACTS.filter(name => files.includes(name));
      const activity = await Promise.all(['state.json', 'chat.jsonl', ...artifacts].map(async (file) => {
        try { return (await stat(join(path, file))).mtimeMs; } catch { return 0; }
      }));
      const updatedAt = new Date(Math.max(directory.mtimeMs, ...activity)).toISOString();
      let state: StoredState = {};
      try {
        state = JSON.parse(await readFile(join(path, 'state.json'), 'utf-8')) ?? {};
      } catch {
        // Legacy artifact/chat-only sessions have no engine state.
      }
      const task = state.session?.task ?? state.task;
      let title = typeof task === 'string' ? sessionTitleFromTask(task) : '';
      if (!title) {
        try {
          const chat = await readFile(join(path, 'chat.jsonl'), 'utf-8');
          for (const line of chat.split('\n')) {
            try {
              const message = JSON.parse(line);
              if (message?.role === 'user' && typeof message.content === 'string') {
                title = sessionTitleFromTask(message.content);
                if (title) break;
              }
            } catch { /* Ignore an incomplete legacy message. */ }
          }
        } catch { /* No chat history yet. */ }
      }
      if (!title) {
        title = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(entry.name)
          ? `Untitled session · ${updatedAt.slice(0, 16).replace('T', ' ')}`
          : entry.name.replace(/[-_]+/g, ' ');
      }
      return {
        id: entry.name,
        path,
        title,
        isRunning: activeRuns?.has(entry.name) ?? false,
        phase: state.session?.phase ?? state.phase,
        artifacts,
        updatedAt,
      } satisfies DesktopSessionSummary;
    } catch {
      // A disappearing or unreadable entry must not hide the other sessions.
      return null;
    }
  }));
  return listed.filter((session): session is DesktopSessionSummary => session !== null)
    .sort((a, b) => Number(b.isRunning) - Number(a.isRunning)
      || b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
}

function generatedRoot(root: string, sessionId: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) throw new Error('Invalid session id');
  return resolve(root, sessionId, 'generated');
}

export async function listSessionFiles(root: string, sessionId: string): Promise<string[]> {
  const base = generatedRoot(root, sessionId);
  const files: string[] = [];
  try {
    if ((await lstat(base)).isSymbolicLink()) return [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const visit = async (dir: string): Promise<void> => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(relative(base, path).replace(/\\/g, '/'));
    }
  };
  await visit(base);
  return files.sort();
}

export async function readSessionFile(root: string, sessionId: string, path: string): Promise<string> {
  const base = generatedRoot(root, sessionId);
  if ((await lstat(base)).isSymbolicLink()) throw new Error('Source path escapes generated files');
  const target = resolve(base, path);
  const isInside = (parent: string, child: string) => {
    const rel = relative(parent, child);
    return rel !== '' && rel !== '..' && !rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) && !isAbsolute(rel);
  };
  if (!isInside(base, target)) throw new Error('Source path escapes generated files');
  const [canonicalBase, canonicalTarget] = await Promise.all([realpath(base), realpath(target)]);
  if (!isInside(canonicalBase, canonicalTarget)) throw new Error('Source path escapes generated files');
  return readFile(canonicalTarget, 'utf-8');
}
