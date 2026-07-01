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
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KB_PORT = Number(process.env.KB_PORT ?? 4000);
const KB_URL = `http://localhost:${KB_PORT}`;
const HEALTH_ENDPOINT = `${KB_URL}/health`;
const MAX_WAIT_MS = 8000;
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
  const masterPassword = process.env.KB_MASTER_PASSWORD ?? 'aix-local-dev';
  const child = spawn(process.execPath, [mainJs], {
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      PORT: String(KB_PORT),
      KB_MASTER_PASSWORD: masterPassword,
    },
  });
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
 * Returns the API key from env, or undefined (unauthenticated local dev).
 */
export function getKbApiKey(): string | undefined {
  return process.env.KB_API_KEY;
}

export async function shutdownKbServer(): Promise<void> {
  if (await isAlive()) {
    try {
      console.log(`[kb] Shutting down kb-server at ${KB_URL}...`);
      await fetch(`${KB_URL}/shutdown`, { method: 'POST' });
    } catch {
      // ignore
    }
  }
}

export { KB_URL };
