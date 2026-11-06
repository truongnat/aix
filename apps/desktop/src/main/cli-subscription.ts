import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';

const execFileAsync = promisify(execFile);

/**
 * Detects and refreshes "CLI subscription" credentials — local logins from
 * tools like Claude Code — so the desktop app can run without any API key.
 *
 * Only public OAuth endpoints and the local credential files those CLIs
 * already created on this machine are used. Tokens are kept in memory and in
 * process env for the engine; they are never logged, persisted, or sent to
 * the renderer.
 */

// Public, well-known client id of the Claude Code CLI (PKCE OAuth client).
const CLAUDE_CODE_CLIENT_ID = '9d1c250a-e61b-44d9-88ed-5944d1962f5e';
const CLAUDE_OAUTH_TOKEN_URL = 'https://console.anthropic.com/v1/oauth/token';

export interface ClaudeCodeCredentials {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number | null;
  readonly source: 'file' | 'keychain';
}

export interface CliSubscriptionInfo {
  readonly id: 'claude-code';
  readonly name: string;
  readonly detected: boolean;
  readonly status: 'active' | 'expired' | 'requires-login';
  readonly expiresAt: string | null;
  readonly source: 'file' | 'keychain' | null;
}

interface ClaudeCodeKeychainPayload {
  claudeAiOauth?: { accessToken?: string; refreshToken?: string; expiresAt?: number };
}

let cachedCredentials: ClaudeCodeCredentials | null = null;

async function readCredentialsFile(): Promise<ClaudeCodeCredentials | null> {
  try {
    const raw = await readFile(join(homedir(), '.claude', '.credentials.json'), 'utf-8');
    const parsed = JSON.parse(raw) as ClaudeCodeKeychainPayload;
    const oauth = parsed.claudeAiOauth;
    if (!oauth?.accessToken || !oauth.refreshToken) return null;
    return {
      accessToken: oauth.accessToken,
      refreshToken: oauth.refreshToken,
      expiresAt: typeof oauth.expiresAt === 'number' ? oauth.expiresAt : null,
      source: 'file',
    };
  } catch {
    return null;
  }
}

async function readCredentialsKeychain(): Promise<ClaudeCodeCredentials | null> {
  if (process.platform !== 'darwin') return null;
  try {
    const { stdout } = await execFileAsync(
      'security',
      ['find-generic-password', '-s', 'Claude Code-credentials', '-w'],
      { timeout: 5000 },
    );
    const parsed = JSON.parse(stdout.trim()) as ClaudeCodeKeychainPayload;
    const oauth = parsed.claudeAiOauth;
    if (!oauth?.accessToken || !oauth.refreshToken) return null;
    return {
      accessToken: oauth.accessToken,
      refreshToken: oauth.refreshToken,
      expiresAt: typeof oauth.expiresAt === 'number' ? oauth.expiresAt : null,
      source: 'keychain',
    };
  } catch {
    return null;
  }
}

async function readClaudeCodeCredentials(): Promise<ClaudeCodeCredentials | null> {
  // macOS: Claude Code updates the Keychain copy on every refresh, so prefer
  // it over the on-disk file (which can be stale).
  return (await readCredentialsKeychain()) ?? (await readCredentialsFile());
}

interface TokenRefreshResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

async function refreshClaudeAccessToken(refreshToken: string): Promise<ClaudeCodeCredentials> {
  let response: Response;
  try {
    response = await fetch(CLAUDE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLAUDE_CODE_CLIENT_ID,
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error: unknown) {
    throw new Error(`Could not reach the Claude OAuth endpoint to refresh the subscription token: ${String(error)}`);
  }

  const data = await response.json().catch(() => ({})) as TokenRefreshResponse;
  if (!response.ok || !data.access_token) {
    const detail = data.error_description ?? data.error ?? `HTTP ${response.status}`;
    throw new Error(
      `Claude subscription token refresh failed (${detail}). Open Claude Code and run /login to re-authenticate, then retry.`,
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : null,
    source: cachedCredentials?.source ?? 'file',
  };
}

/** Returns a valid access token, refreshing it when missing or near expiry. */
export async function ensureClaudeSubscriptionToken(): Promise<string> {
  if (cachedCredentials?.accessToken) {
    const stillValid = !cachedCredentials.expiresAt || cachedCredentials.expiresAt > Date.now() + 60_000;
    if (stillValid) return cachedCredentials.accessToken;
  }

  const stored = await readClaudeCodeCredentials();
  if (!stored?.accessToken) {
    throw new Error('No Claude Code subscription found. Install Claude Code and run `claude /login` first.');
  }

  const expiresSoon = !stored.expiresAt || stored.expiresAt <= Date.now() + 60_000;
  const credentials = expiresSoon ? await refreshClaudeAccessToken(stored.refreshToken) : stored;
  cachedCredentials = credentials;
  return credentials.accessToken;
}

/** Applies a fresh subscription token to the engine runtime environment. */
export async function applyClaudeSubscriptionEnv(): Promise<void> {
  const token = await ensureClaudeSubscriptionToken();
  process.env['AIX_OAUTH_TOKEN'] = token;
}

export function clearClaudeSubscriptionEnv(): void {
  delete process.env['AIX_OAUTH_TOKEN'];
}

/** Detection summary. Never includes tokens. */
export async function listClaudeCodeSubscription(): Promise<CliSubscriptionInfo | null> {
  return (await listCliSubscriptions())[0] ?? null;
}

/** Detection summary for the renderer. Never includes tokens. */
export async function listCliSubscriptions(): Promise<readonly CliSubscriptionInfo[]> {
  const stored = await readClaudeCodeCredentials();
  const info: CliSubscriptionInfo = stored
    ? {
        id: 'claude-code',
        name: 'Claude Code (Anthropic subscription)',
        detected: true,
        status: !stored.expiresAt || stored.expiresAt > Date.now()
          ? 'active'
          : 'expired',
        expiresAt: stored.expiresAt ? new Date(stored.expiresAt).toISOString() : null,
        source: stored.source,
      }
    : {
        id: 'claude-code',
        name: 'Claude Code (Anthropic subscription)',
        detected: false,
        status: 'requires-login',
        expiresAt: null,
        source: null,
      };
  return [info];
}
