/**
 * KbServerManager — ensures kb-server is running before a session starts.
 *
 * Strategy:
 * 1. Health-check localhost:KB_PORT/health (fast, < 500ms)
 * 2. If alive → return server URL immediately.
 * 3. If not → locate kb-server dist/main.js and spawn it as a detached process,
 *    then poll health up to MAX_WAIT_MS.
 * 4. If spawn fails or health never comes → warn and return null
 *    (callers fall back to MarkdownStore).
 */

import { spawn } from 'node:child_process';
import {
  chmodSync, closeSync, constants, existsSync, fchmodSync, fstatSync, linkSync,
  mkdirSync, openSync, readFileSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { randomBytes } from 'node:crypto';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KB_PORT = Number(process.env.KB_PORT ?? 4000);
const KB_HOST = process.env.KB_HOST ?? '127.0.0.1';
const connectHost = KB_HOST === '0.0.0.0' ? '127.0.0.1' : KB_HOST === '::' ? '::1' : KB_HOST;
const KB_URL = `http://${connectHost.includes(':') ? `[${connectHost}]` : connectHost}:${KB_PORT}`;
const HEALTH_ENDPOINT = `${KB_URL}/health`;
const MAX_WAIT_MS = 8000;
let spawnedServer = false;
const POLL_INTERVAL_MS = 300;

async function isAlive(): Promise<boolean> {
  try {
    const res = await fetch(HEALTH_ENDPOINT, { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

function findKbServerMain(): string | null {
  // Walk up from this file to find the monorepo root, then locate kb-server.
  const here = dirname(fileURLToPath(import.meta.url));

  const candidates = [
    // Running from packages/cli/dist/ → monorepo root is ../../../
    join(here, '..', '..', '..', 'services', 'kb-server', 'dist', 'main.js'),
    // Running from repo root dist/
    join(here, '..', 'services', 'kb-server', 'dist', 'main.js'),
    // Explicit env override
    process.env.KB_SERVER_MAIN ?? '',
  ].filter(Boolean);

  return candidates.find(existsSync) ?? null;
}

async function pollUntilAlive(maxMs: number): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (await isAlive()) return true;
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
  return false;
}

function spawnServer(mainJs: string): void {
  const masterPassword = process.env.KB_MASTER_PASSWORD || getLocalMasterPassword(true);
  const child = spawn(process.execPath, [mainJs], {
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      PORT: String(KB_PORT),
      KB_HOST,
      KB_MASTER_PASSWORD: masterPassword,
    },
  });
  spawnedServer = child.pid !== undefined;
  child.once('exit', () => { spawnedServer = false; });
  child.once('error', () => { spawnedServer = false; });
  child.unref(); // Let the parent process exit independently.
}

/**
 * Ensures kb-server is running.
 * Returns the server URL if available, null if it could not be started.
 */
export async function ensureKbServer(): Promise<string | null> {
  // Fast path: already running.
  if (await isAlive()) return KB_URL;

  const mainJs = findKbServerMain();
  if (!mainJs) {
    console.warn('[kb] Cannot locate kb-server dist/main.js — falling back to markdown storage.');
    return null;
  }

  console.log(`[kb] Starting kb-server from ${mainJs} ...`);
  spawnServer(mainJs);

  const ok = await pollUntilAlive(MAX_WAIT_MS);
  if (ok) {
    console.log(`[kb] kb-server ready at ${KB_URL}`);
    return KB_URL;
  }

  console.warn('[kb] kb-server did not start in time — falling back to markdown storage.');
  return null;
}

/**
 * Resolve the same management secret for startup, memory access, and shutdown.
 * A private file keeps the local default stable across independent CLI processes.
 */
export function getKbCredentials(): { apiKey?: string; masterPassword?: string } {
  const apiKey = process.env.KB_API_KEY || undefined;
  if (process.env.KB_MASTER_PASSWORD) return { ...(apiKey ? { apiKey } : {}), masterPassword: process.env.KB_MASTER_PASSWORD };
  if (apiKey) return { apiKey };
  return { masterPassword: getLocalMasterPassword(true) };
}

function getLocalMasterPassword(create: true): string;
function getLocalMasterPassword(create: false): string | undefined;
function getLocalMasterPassword(create: boolean): string | undefined {
  const dataDir = process.env.KB_DATA_DIR ?? join(homedir(), '.aix', 'kb');
  const passwordFile = join(dataDir, 'master-password');
  if (!create && !existsSync(passwordFile)) return undefined;
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  chmodSync(dataDir, 0o700);

  if (!existsSync(passwordFile)) {
    // Publish a fully written file atomically, including when two CLI processes start together.
    const temporaryFile = join(dataDir, `.master-password-${randomBytes(16).toString('hex')}`);
    writeFileSync(temporaryFile, randomBytes(32).toString('hex'), { mode: 0o600, flag: 'wx' });
    try {
      try {
        linkSync(temporaryFile, passwordFile);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      }
    } finally {
      unlinkSync(temporaryFile);
    }
  }

  const descriptor = openSync(passwordFile, constants.O_RDONLY | constants.O_NOFOLLOW);
  let masterPassword: string;
  try {
    const info = fstatSync(descriptor);
    if (!info.isFile() || (process.getuid && info.uid !== process.getuid())) {
      throw new Error('[kb] management credential must be a regular file owned by the current user');
    }
    fchmodSync(descriptor, 0o600);
    masterPassword = readFileSync(descriptor, 'utf8').trim();
    if (!/^[a-f0-9]{64}$/.test(masterPassword)) {
      throw new Error('[kb] invalid local management credential; restore the private credential file or set KB_MASTER_PASSWORD');
    }
  } finally {
    closeSync(descriptor);
  }
  return masterPassword;
}

export async function shutdownKbServer(opts?: { ownedOnly?: boolean }): Promise<void> {
  if (opts?.ownedOnly && !spawnedServer) return;
  if (!(await isAlive())) return;
  const masterPassword = process.env.KB_MASTER_PASSWORD || getLocalMasterPassword(false);
  if (!masterPassword) throw new Error('[kb] shutdown requires KB_MASTER_PASSWORD or an existing local management credential');
  console.log(`[kb] Shutting down kb-server at ${KB_URL}...`);
  const response = await fetch(`${KB_URL}/shutdown`, {
    method: 'POST',
    headers: { 'x-master-password': masterPassword },
    signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) throw new Error(`[kb] shutdown failed (HTTP ${response.status}); check KB_MASTER_PASSWORD`);
  spawnedServer = false;
}

export { KB_URL };
