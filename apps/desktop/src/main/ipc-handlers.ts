import { app, dialog, ipcMain, safeStorage } from 'electron';
import { readdir, readFile, stat, unlink, writeFile, mkdir, chmod } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, relative, isAbsolute, dirname } from 'node:path';
import { homedir } from 'node:os';
import { exec, execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { SkillRegistry } from '@x/registry';
import { MarkdownStore, RedactedMemoryStore } from '@x/memory';
import { PolicyEngine, redactStrings } from '@x/policy';
import { createProvider } from '@x/providers';
import { GuardrailLoop } from '@x/core';
import type { SkillCategory, Phase, Provider } from '@x/core';
import { Compiler } from '@x/compiler';
import { ClaudeAdapter, CursorAdapter, CodexAdapter, GeminiAdapter } from '@x/providers';
import {
  EngineGraph,
  SessionStore,
  createInitialEngineState,
  discussNode,
  planNode,
} from '@x/engine';
import { DesktopHitlChannel } from './desktop-hitl-channel.js';
import type {
  DesktopSkillSummary,
  DesktopSkillDetail,
  DesktopMemoryRecord,
  DesktopSessionSummary,
  DesktopVerificationResult,
  DesktopSystemStatus,
  DesktopAiConfig,
  DesktopTestConnectionResult,
  DesktopKbStatus,
  DesktopChatMessage,
  AiProviderId,
} from '../shared/api.js';
import { providerEnvironmentFor } from '../shared/desktop-logic.js';
import { applyClaudeSubscriptionEnv, clearClaudeSubscriptionEnv, ensureClaudeSubscriptionToken, listCliSubscriptions } from './cli-subscription.js';
import { detectModelSources, ensureSourceEnv } from './model-sources.js';

const execFileAsync = promisify(execFile);
let kbServerStartedByApp = false;

export {
  ALLOWED_TEST_PRESETS,
  validateVerificationCommand,
  isPathContained,
  isAllowedNavigationUrl,
} from '../shared/security.js';
import {
  validateVerificationCommand,
  isPathContained,
} from '../shared/security.js';

export interface IpcHandlerPaths {
  readonly repoRoot: string;
  readonly storageRoot?: string;
}

export async function getMasterPassword(storageRoot: string): Promise<string> {
  const passwordFile = join(storageRoot, '.aix', 'kb-master-password.txt');
  try {
    const password = (await readFile(passwordFile, 'utf-8')).trim();
    await chmod(passwordFile, 0o600);
    return password;
  } catch (error: unknown) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
    const generated = 'aix-kb-master-' + crypto.randomUUID().slice(0, 8);
    await mkdir(dirname(passwordFile), { recursive: true });
    await writeFile(passwordFile, generated, { encoding: 'utf-8', mode: 0o600 });
    await chmod(passwordFile, 0o600);
    return generated;
  }
}

export async function checkKbHealth(): Promise<{ online: boolean; port: number; url: string }> {
  for (const port of [4000, 3001]) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(600) });
      if (res.ok) {
        return { online: true, port, url: `http://127.0.0.1:${port}` };
      }
    } catch {
      // Continue to next port
    }
  }
  return { online: false, port: 4000, url: 'http://127.0.0.1:4000' };
}

export function findNodeBinary(): string {
  if (process.env['NODE'] && existsSync(process.env['NODE'])) return process.env['NODE'];
  const candidates = [
    join(homedir(), '.local', 'share', 'mise', 'installs', 'node', 'lts', 'bin', 'node'),
    join(homedir(), '.local', 'share', 'mise', 'installs', 'node', '24.21.0', 'bin', 'node'),
    join(homedir(), '.nvm', 'versions', 'node', 'default', 'bin', 'node'),
    '/opt/homebrew/bin/node',
    '/opt/homebrew/opt/node/bin/node',
    '/usr/local/bin/node',
    '/usr/bin/node',
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return 'node';
}

export async function ensureKbServerRunning(paths: { repoRoot: string; storageRoot?: string }): Promise<{ ok: boolean; port: number; url: string; message: string }> {
  const storageRoot = paths.storageRoot ?? paths.repoRoot;
  const currentHealth = await checkKbHealth();
  if (currentHealth.online) {
    return { ok: true, port: currentHealth.port, url: currentHealth.url, message: `KB Service is already running at ${currentHealth.url}` };
  }

  const masterPassword = await getMasterPassword(storageRoot);
  const serviceRoot = app.isPackaged
    ? join(paths.repoRoot, 'kb-server')
    : join(paths.repoRoot, 'services', 'kb-server');
  const kbMain = join(serviceRoot, 'dist', 'main.js');
  if (!existsSync(kbMain)) {
    return {
      ok: false,
      port: 4000,
      url: 'http://127.0.0.1:4000',
      message: 'KB server runtime is not bundled with this build. Start the KB service separately or use a development build.',
    };
  }

  try {
    const nodeBin = findNodeBinary();
    const { stdout: nodeVersionOutput } = await execFileAsync(nodeBin, ['--version'], { timeout: 3000 });
    const nodeMajor = Number(/^v?(\d+)/.exec(nodeVersionOutput.trim())?.[1] ?? 0);
    if (nodeMajor < 22) {
      return {
        ok: false,
        port: 4000,
        url: 'http://127.0.0.1:4000',
        message: `KB Server requires Node.js 22 or newer for node:sqlite; found ${nodeVersionOutput.trim() || 'unknown version'}.`,
      };
    }
    const child = spawn(nodeBin, [kbMain], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: serviceRoot,
      env: {
        ...process.env,
        PATH: `${dirname(nodeBin)}:${process.env['PATH'] ?? ''}`,
        ...(app.isPackaged ? { NODE_ENV: 'production' } : {}),
        PORT: '4000',
        KB_HOST: '127.0.0.1',
        KB_MASTER_PASSWORD: masterPassword,
      },
    });

    let stderrBuffer = '';
    const spawnState: { error?: Error } = {};
    child.stderr?.on('data', (d: Buffer) => {
      stderrBuffer += d.toString();
    });

    child.on('error', (err: Error) => {
      spawnState.error = err;
      console.error('[kb-server-spawn-error]', err);
    });

    child.unref();

    // Poll health up to 5 seconds
    const start = Date.now();
    while (Date.now() - start < 5000) {
      await new Promise(r => setTimeout(r, 250));
      if (spawnState.error) break;
      const h = await checkKbHealth();
      if (h.online) {
        kbServerStartedByApp = true;
        return { ok: true, port: h.port, url: h.url, message: `KB Server launched successfully on http://127.0.0.1:${h.port}!` };
      }
    }

    return {
      ok: false,
      port: 4000,
      url: 'http://127.0.0.1:4000',
      message: spawnState.error
        ? `Could not spawn KB Server: ${spawnState.error.message}`
        : `KB Server started with ${nodeBin} but health check timed out: ${stderrBuffer.trim() || 'Health check timed out'}`,
    };
  } catch (err: unknown) {
    return { ok: false, port: 4000, url: 'http://127.0.0.1:4000', message: `Failed to spawn KB server: ${String(err)}` };
  }
}

export async function shutdownKbServer(paths: { storageRoot?: string; onlyIfOwned?: boolean }): Promise<{ ok: boolean; message: string }> {
  if (paths.onlyIfOwned && !kbServerStartedByApp) {
    return { ok: true, message: 'Leaving the pre-existing KB service running.' };
  }
  const storageRoot = paths.storageRoot ?? join(homedir(), '.aix');
  const masterPassword = await getMasterPassword(storageRoot);
  let stopped = false;
  for (const port of [4000, 3001]) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/shutdown`, {
        method: 'POST',
        headers: { 'x-master-password': masterPassword },
        signal: AbortSignal.timeout(1500),
      });
      stopped ||= response.ok;
    } catch (error: unknown) {
      if (!(error instanceof TypeError)) throw error;
    }
  }
  if (stopped) kbServerStartedByApp = false;
  return stopped
    ? { ok: true, message: 'KB Service shutdown signal sent.' }
    : { ok: false, message: 'KB Service did not accept the shutdown request; it may be owned by another process.' };
}

export function registerIpcHandlers(paths: IpcHandlerPaths | string): void {
  const repoRoot = typeof paths === 'string' ? paths : paths.repoRoot;
  const storageRoot = typeof paths === 'string' ? paths : (paths.storageRoot ?? paths.repoRoot);
  const policy = new PolicyEngine();
  const memoryStore = new RedactedMemoryStore(new MarkdownStore(storageRoot), policy);
  const activeChannels = new Map<string, DesktopHitlChannel>();
  const activeRuns = new Map<string, AbortController>();
  let cachedRegistry: SkillRegistry | null = null;

  async function getRegistry(): Promise<SkillRegistry> {
    if (!cachedRegistry) {
      cachedRegistry = await SkillRegistry.load(repoRoot);
    }
    return cachedRegistry;
  }

  const aiConfigFile = join(storageRoot, '.aix', 'ai-config.json');
  const kbPasswordFile = join(storageRoot, '.aix', 'kb-master-password.txt');

  const providerKeys: Readonly<Record<AiProviderId, string>> = {
    inferx: 'INFERX_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    groq: 'GROQ_API_KEY',
    ollama: '',
    codex: '',
    mock: '',
  };
  const defaultModels: Readonly<Record<AiProviderId, string>> = {
    inferx: 'deepseek-v4.1-flash-1017-basic',
    anthropic: 'claude-sonnet-4-6',
    openai: 'gpt-4o',
    groq: 'llama3-70b-8192',
    ollama: 'deepseek-r1:latest',
    codex: 'gpt-5.1-codex-max',
    mock: 'mock-engine-v1',
  };

  async function saveAiConfig(config: { provider: AiProviderId; model: string; apiKey: string; baseUrl?: string; useSubscription?: boolean }): Promise<void> {
    const persisted: Record<string, string> = {
      provider: config.provider,
      model: config.model,
    };
    if (config.useSubscription) persisted['authMode'] = 'subscription';
    if (config.apiKey) {
      if (safeStorage.isEncryptionAvailable()) {
        persisted['apiKeyEncrypted'] = safeStorage.encryptString(config.apiKey).toString('base64');
      } else {
        persisted['apiKey'] = config.apiKey;
      }
    }
    if (config.baseUrl) persisted['baseUrl'] = config.baseUrl;
    await mkdir(dirname(aiConfigFile), { recursive: true });
    await writeFile(aiConfigFile, JSON.stringify(persisted, null, 2), { encoding: 'utf-8', mode: 0o600 });
    await chmod(aiConfigFile, 0o600);
  }

  async function applyAiConfigToRuntime(config: { provider: AiProviderId; model: string; apiKey: string; baseUrl?: string; useSubscription?: boolean }): Promise<void> {
    delete process.env['AIX_API_KEY'];
    delete process.env['AIX_API_URL'];
    delete process.env['AIX_OAUTH_TOKEN'];
    delete process.env['AIX_OAUTH_ACCOUNT_ID'];
    Object.assign(process.env, providerEnvironmentFor(config));
    if (config.provider === 'codex') {
      // Pulls the Codex CLI's ChatGPT subscription token into the engine env.
      await ensureSourceEnv('codex');
    } else if (config.useSubscription && config.provider === 'anthropic') {
      // Pulls a valid Claude Code subscription token (refreshing if needed)
      // into AIX_OAUTH_TOKEN for the engine — no API key required.
      await applyClaudeSubscriptionEnv();
    }
  }

  async function loadAiConfig(): Promise<{ provider: AiProviderId; model: string; apiKey: string; baseUrl?: string; useSubscription?: boolean }> {
    let raw: string;
    try {
      raw = await readFile(aiConfigFile, 'utf-8');
    } catch (error: unknown) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
      let ompKey = '';
      let ompUrl = '';
      try {
        const ompYml = await readFile(join(homedir(), '.omp', 'agent', 'models.yml'), 'utf-8');
        ompKey = ompYml.match(/apiKey:\s*([^\s\r\n]+)/)?.[1] ?? '';
        ompUrl = ompYml.match(/baseUrl:\s*([^\s\r\n]+)/)?.[1] ?? '';
      } catch (ompError: unknown) {
        if (!(ompError instanceof Error) || !('code' in ompError) || ompError.code !== 'ENOENT') throw ompError;
      }
      if (ompKey) {
        return { provider: 'inferx', model: defaultModels.inferx, apiKey: ompKey, baseUrl: ompUrl || 'https://model.inferx.net/endpoints/v1/chat/completions' };
      }

      const requestedProvider = process.env['AIX_PROVIDER'] as AiProviderId | undefined;
      const provider = requestedProvider && requestedProvider in defaultModels ? requestedProvider : 'anthropic';
      const keyName = providerKeys[provider];
      const modelEnvName = `${provider.toUpperCase()}_MODEL`;
      const envKey = keyName ? process.env[keyName] ?? '' : '';
      // No stored config: prefer the Claude Code CLI subscription when the
      // user has one and no API key is present — zero-key default.
      const subscriptions = provider === 'anthropic' && !envKey ? await listCliSubscriptions() : [];
      return {
        provider,
        model: process.env['AIX_MODEL'] ?? process.env[modelEnvName] ?? defaultModels[provider],
        apiKey: envKey,
        useSubscription: provider === 'anthropic' && !envKey && (subscriptions[0]?.detected ?? false),
      };
    }

    await chmod(aiConfigFile, 0o600);
    const parsed = JSON.parse(raw) as {
      provider?: AiProviderId;
      model?: string;
      apiKey?: string;
      apiKeyEncrypted?: string;
      baseUrl?: string;
      authMode?: string;
    };
    const provider = parsed.provider && Object.hasOwn(defaultModels, parsed.provider) ? parsed.provider : 'anthropic';
    let apiKey = parsed.apiKey ?? '';
    if (parsed.apiKeyEncrypted) {
      if (!safeStorage.isEncryptionAvailable()) throw new Error('Cannot decrypt the saved provider key on this device');
      apiKey = safeStorage.decryptString(Buffer.from(parsed.apiKeyEncrypted, 'base64'));
    } else if (apiKey && safeStorage.isEncryptionAvailable()) {
      await saveAiConfig({ provider, model: parsed.model ?? defaultModels[provider], apiKey, baseUrl: parsed.baseUrl, useSubscription: parsed.authMode === 'subscription' });
    }
    const providerEnvKey = providerKeys[provider];
    const envKey = providerEnvKey ? process.env[providerEnvKey] ?? '' : '';
    const useSubscription = parsed.authMode === 'subscription' && !apiKey && !envKey;
    return {
      provider,
      model: parsed.model ?? defaultModels[provider],
      apiKey: apiKey || envKey,
      baseUrl: parsed.baseUrl,
      useSubscription,
    };
  }


  // System Status
  ipcMain.handle('system:getStatus', async (): Promise<DesktopSystemStatus> => {
    const registry = await getRegistry();
    const memories = await memoryStore.list();
    const kb = await checkKbHealth();
    const ai = await loadAiConfig();

    return {
      appVersion: app ? app.getVersion() : '0.1.0',
      nodeVersion: process.version,
      platform: process.platform,
      cwd: repoRoot,
      skillsCount: registry.all().length,
      memoryCount: memories.length,
      kbServiceOnline: kb.online,
      kbPort: kb.port,
      activeAiProvider: ai.provider,
      activeAiModel: ai.model,
    };
  });

  // AI Configuration & Testing
  ipcMain.handle('ai:getConfig', async (): Promise<DesktopAiConfig> => {
    const cfg = await loadAiConfig();
    return {
      provider: cfg.provider,
      model: cfg.model,
      hasApiKey: Boolean(cfg.apiKey),
      baseUrl: cfg.baseUrl,
      useSubscription: cfg.useSubscription ?? false,
    };
  });

  ipcMain.handle('ai:detectSources', async () => detectModelSources());

  ipcMain.handle('ai:setConfig', async (_, newConfig: { provider: AiProviderId; model: string; apiKey?: string; baseUrl?: string; useSubscription?: boolean; sourceId?: string }) => {
    const existing = await loadAiConfig();
    if (!Object.hasOwn(defaultModels, newConfig.provider)) throw new Error('Unsupported AI provider');
    const model = newConfig.model.trim();
    if (!model) throw new Error('Model name is required');
    const useSubscription = (newConfig.sourceId === 'claude-code' || newConfig.useSubscription === true)
      && newConfig.provider === 'anthropic';
    if (newConfig.sourceId === 'claude-code') {
      // Fail early with a clear message if no CLI subscription is usable.
      await applyClaudeSubscriptionEnv();
    }
    if (newConfig.sourceId === 'codex' && newConfig.provider === 'codex') {
      await ensureSourceEnv('codex');
    }
    const finalApiKey = newConfig.apiKey?.trim()
      ? newConfig.apiKey.trim()
      : useSubscription || newConfig.provider === 'codex'
        ? ''
        : existing.provider === newConfig.provider ? existing.apiKey : '';
    const finalConfig = {
      provider: newConfig.provider,
      model,
      apiKey: finalApiKey,
      baseUrl: newConfig.baseUrl?.trim() || undefined,
      useSubscription,
    };

    await saveAiConfig(finalConfig);
    await applyAiConfigToRuntime(finalConfig);

    return { ok: true };
  });

  ipcMain.handle('ai:testConnection', async (_, testParams?: { provider: AiProviderId; model: string; apiKey?: string; baseUrl?: string; useSubscription?: boolean }): Promise<DesktopTestConnectionResult> => {
    const current = await loadAiConfig();
    const provider = testParams?.provider ?? current.provider;
    const model = testParams?.model ?? current.model;
    const useSubscription = provider === 'anthropic'
      && (testParams ? testParams.useSubscription === true : current.useSubscription === true);
    const apiKey = testParams?.apiKey?.trim()
      ? testParams.apiKey.trim()
      : provider === current.provider ? current.apiKey : '';
    const baseUrl = testParams?.baseUrl?.trim()
      ? testParams.baseUrl.trim()
      : provider === current.provider ? current.baseUrl : undefined;

    if (provider === 'mock') {
      return { ok: true, latencyMs: 5, message: 'Mock provider active (offline mode)' };
    }

    if (provider === 'codex') {
      const start = Date.now();
      try {
        await ensureSourceEnv('codex');
        const codexProvider = createProvider({ ...process.env, AIX_PROVIDER: 'codex', AIX_MODEL: model });
        await codexProvider.call({ system: 'ping', user: 'Reply with OK', maxTokens: 16 });
        return { ok: true, latencyMs: Date.now() - start, message: `Connected via Codex subscription (${model}) in ${Date.now() - start}ms` };
      } catch (error: unknown) {
        return { ok: false, latencyMs: Date.now() - start, message: 'Codex subscription unavailable', error: String(error instanceof Error ? error.message : error) };
      }
    }

    if (!apiKey && !useSubscription && provider !== 'ollama') {
      return { ok: false, latencyMs: 0, message: 'Missing API Key', error: `Missing API Key for provider "${provider}"` };
    }

    const start = Date.now();
    try {
      if (provider === 'anthropic') {
        let oauthToken = '';
        if (useSubscription) {
          try {
            oauthToken = await ensureClaudeSubscriptionToken();
          } catch (error: unknown) {
            return { ok: false, latencyMs: 0, message: 'Claude subscription unavailable', error: String(error instanceof Error ? error.message : error) };
          }
        }
        const url = baseUrl || 'https://api.anthropic.com/v1/messages';
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(oauthToken
              ? { 'Authorization': `Bearer ${oauthToken}`, 'anthropic-beta': 'oauth-2025-04-20' }
              : { 'x-api-key': apiKey }),
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
          signal: AbortSignal.timeout(10000),
        });
        const latencyMs = Date.now() - start;
        if (!res.ok) {
          const errText = await res.text();
          return { ok: false, latencyMs, message: 'Anthropic API error', error: `Anthropic API error (${res.status}): ${errText.slice(0, 160)}` };
        }
        return { ok: true, latencyMs, message: `Connected to Anthropic (${model}) in ${latencyMs}ms` };
      }

      if (provider === 'inferx' || provider === 'openai' || provider === 'groq' || provider === 'ollama') {
        const url = baseUrl || (
          provider === 'inferx'
            ? 'https://model.inferx.net/endpoints/v1/chat/completions'
            : provider === 'groq'
              ? 'https://api.groq.com/openai/v1/chat/completions'
              : provider === 'ollama'
                ? 'http://127.0.0.1:11434/v1/chat/completions'
                : 'https://api.openai.com/v1/chat/completions'
        );
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
          signal: AbortSignal.timeout(10000),
        });
        const latencyMs = Date.now() - start;
        if (!res.ok) {
          const errText = await res.text();
          return { ok: false, latencyMs, message: `${provider.toUpperCase()} API error`, error: `${provider.toUpperCase()} API error (${res.status}): ${errText.slice(0, 160)}` };
        }
        return { ok: true, latencyMs, message: `Connected to ${provider.toUpperCase()} (${model}) in ${latencyMs}ms` };
      }

      return { ok: false, latencyMs: 0, message: 'Unsupported provider', error: `Unsupported provider: ${provider}` };
    } catch (err: unknown) {
      return { ok: false, latencyMs: Date.now() - start, message: 'Connection failed', error: String(err) };
    }
  });

  ipcMain.handle('system:getKbStatus', async (): Promise<DesktopKbStatus> => {
    const h = await checkKbHealth();
    return {
      online: h.online,
      port: h.port,
      url: h.url,
    };
  });

  // Skills
  ipcMain.handle('skills:list', async (_, category?: SkillCategory): Promise<readonly DesktopSkillSummary[]> => {
    const registry = await getRegistry();
    const skills = category ? registry.byCategory(category) : registry.all();
    return skills.map(s => ({
      id: s.id,
      name: s.frontmatter.name,
      description: s.frontmatter.description,
      kind: s.frontmatter['x-kind'],
      category: s.category,
      tags: s.frontmatter['x-tags'],
      roles: s.frontmatter['x-roles'],
      compatible: s.frontmatter['x-compatible'],
      version: s.frontmatter['x-version'],
      referencesCount: s.references.length,
    }));
  });

  ipcMain.handle('skills:get', async (_, name: string): Promise<DesktopSkillDetail | undefined> => {
    if (!/^[a-z0-9-]+$/.test(name)) return undefined;
    const registry = await getRegistry();
    const s = registry.get(name);
    if (!s) return undefined;
    return {
      id: s.id,
      name: s.frontmatter.name,
      description: s.frontmatter.description,
      kind: s.frontmatter['x-kind'],
      category: s.category,
      tags: s.frontmatter['x-tags'],
      roles: s.frontmatter['x-roles'],
      compatible: s.frontmatter['x-compatible'],
      version: s.frontmatter['x-version'],
      referencesCount: s.references.length,
      body: s.body,
      bodyTokenEstimate: s.bodyTokenEstimate,
      references: s.references,
      dir: s.dir,
    };
  });

  ipcMain.handle('skills:validate', async () => {
    const registry = await getRegistry();
    const errors = registry.validateAll();
    const warnings = errors.filter(e => e.code === 'WARN').map(e => e.message);
    const fatal = errors.filter(e => e.code !== 'WARN').map(e => `${e.path ? `${e.path}: ` : ''}${e.message}`);
    return {
      valid: registry.all().length,
      warnings,
      errors: fatal,
    };
  });

  ipcMain.handle('skills:getReference', async (_, skillName: string, refPath: string): Promise<string | undefined> => {
    const registry = await getRegistry();
    const s = registry.get(skillName);
    if (!s) return undefined;

    if (!isPathContained(s.dir, refPath)) return undefined;
    const fullPath = resolve(s.dir, refPath);
    try {
      return await readFile(fullPath, 'utf-8');
    } catch {
      return undefined;
    }
  });

  ipcMain.handle('system:installProvider', async (_, provider: Provider, targetDir?: string) => {
    if (!['claude', 'cursor', 'codex', 'gemini'].includes(provider)) {
      throw new Error(`Invalid provider: ${String(provider)}`);
    }
    let targetRoot: string;
    if (app && app.isPackaged) {
      if (targetDir) {
        targetRoot = resolve(targetDir);
      } else {
        const res = await dialog.showOpenDialog({
          title: `Select Project Directory to Sync ${provider.toUpperCase()}`,
          properties: ['openDirectory', 'createDirectory'],
        });
        if (res.canceled || !res.filePaths[0]) {
          return { ok: false, written: 0, skipped: 0 };
        }
        targetRoot = res.filePaths[0];
      }
    } else {
      targetRoot = targetDir ? resolve(targetDir) : repoRoot;
    }

    try {
      const dirStat = await stat(targetRoot);
      if (!dirStat.isDirectory()) return { ok: false, written: 0, skipped: 0 };
    } catch {
      return { ok: false, written: 0, skipped: 0 };
    }
    const registry = await getRegistry();
    const skills = registry.all();
    const catalog = registry.toCatalog();

    const adapters = {
      claude: new ClaudeAdapter(),
      cursor: new CursorAdapter(),
      codex: new CodexAdapter(),
      gemini: new GeminiAdapter(),
    };

    const compiler = new Compiler(adapters);
    const result = await compiler.compile({
      skills,
      catalog,
      agents: [],
      rules: [],
      mcpServers: [],
    }, {
      provider,
      targetRoot,
      dryRun: false,
      force: true,
    });

    return {
      ok: true,
      written: result.written.length,
      skipped: result.skipped.length,
    };
  });

  // Memory
  ipcMain.handle('memory:list', async (): Promise<readonly DesktopMemoryRecord[]> => {
    const records = await memoryStore.list();
    return records.map(r => ({
      id: r.id,
      title: r.title,
      body: r.body,
      kind: r.kind,
      tags: r.tags,
      createdAt: r.createdAt,
    }));
  });

  ipcMain.handle('memory:search', async (_, query: string): Promise<readonly DesktopMemoryRecord[]> => {
    const records = await memoryStore.search(query);
    return records.map(r => ({
      id: r.id,
      title: r.title,
      body: r.body,
      kind: r.kind,
      tags: r.tags,
      createdAt: r.createdAt,
    }));
  });

  ipcMain.handle('memory:push', async (_, title: string, body: string, tags?: string[]) => {
    const id = crypto.randomUUID();
    await memoryStore.push({
      id,
      title,
      body,
      kind: 'solution',
      tags: tags ?? [],
      version: '0.1.0',
      createdAt: new Date().toISOString(),
    });
    return { ok: true, id };
  });

  ipcMain.handle('memory:delete', async (_, id: string): Promise<{ ok: boolean }> => {
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) return { ok: false };
    const filePath = join(storageRoot, '.aix', 'runtime', 'memory', `${id}.md`);
    try {
      await unlink(filePath);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  });

  ipcMain.handle('system:toggleKbService', async (_, action: 'start' | 'stop') => {
    if (action === 'start') {
      return await ensureKbServerRunning({ repoRoot, storageRoot });
    } else {
      return await shutdownKbServer({ storageRoot });
    }
  });

  // Sessions & Spine
  ipcMain.handle('spine:listSessions', async (): Promise<readonly DesktopSessionSummary[]> => {
    const sessionsDir = join(storageRoot, '.aix', 'sessions');
    const sessions: DesktopSessionSummary[] = [];
    try {
      const dirs = await readdir(sessionsDir);
      for (const d of dirs) {
        const full = join(sessionsDir, d);
        const s = await stat(full);
        if (!s.isDirectory()) continue;
        const files = await readdir(full);
        const artifacts = files.filter(f =>
          ['DISCUSSION.md', 'PLAN.md', 'REVIEW.md', 'VERIFY.md', 'REMEMBER.md'].includes(f)
        );
        let phase: Phase | undefined;
        try {
          const stateRaw = await readFile(join(full, 'state.json'), 'utf-8');
          const parsed = JSON.parse(stateRaw);
          phase = parsed.phase;
        } catch {
          // no state.json
        }

        sessions.push({
          id: d,
          path: full,
          phase,
          artifacts,
          updatedAt: s.mtime.toISOString(),
        });
      }
    } catch {
      // no sessions directory
    }
    return sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });

  ipcMain.handle('spine:getArtifact', async (_, sessionId: string, artifactName: string): Promise<string | undefined> => {
    if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) return undefined;
    const safeArtifact = artifactName.replace(/[^A-Za-z0-9_.-]/g, '');
    const artifactPath = resolve(storageRoot, '.aix', 'sessions', sessionId, safeArtifact);
    const expectedDir = resolve(storageRoot, '.aix', 'sessions', sessionId);
    if (!artifactPath.startsWith(expectedDir)) return undefined;

    try {
      return await readFile(artifactPath, 'utf-8');
    } catch {
      return undefined;
    }
  });

  ipcMain.handle('spine:getSessionChat', async (_, sessionId: string): Promise<readonly DesktopChatMessage[]> => {
    if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) return [];
    const chatFile = join(storageRoot, '.aix', 'sessions', sessionId, 'chat.jsonl');
    try {
      const raw = await readFile(chatFile, 'utf-8');
      const lines = raw.split('\n').filter(Boolean);
      return lines.map(line => JSON.parse(line) as DesktopChatMessage);
    } catch {
      return [];
    }
  });

  ipcMain.handle('spine:saveSessionChat', async (_, sessionId: string, messages: readonly DesktopChatMessage[]): Promise<{ ok: boolean }> => {
    if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) return { ok: false };
    const sessionDir = join(storageRoot, '.aix', 'sessions', sessionId);
    const chatFile = join(sessionDir, 'chat.jsonl');
    try {
      await mkdir(sessionDir, { recursive: true });
      const content = messages.map(m => JSON.stringify(m)).join('\n') + '\n';
      await writeFile(chatFile, content, 'utf-8');
      return { ok: true };
    } catch {
      return { ok: false };
    }
  });

  // Live Spine Runner & HITL
  ipcMain.handle('spine:respondHitl', async (_, requestId: string, decision: 'approve' | 'revise' | 'cancel', note?: string): Promise<boolean> => {
    for (const channel of activeChannels.values()) {
      if (channel.respond(requestId, decision, note)) {
        return true;
      }
    }
    return false;
  });

  // Cooperative stop: the run checks the signal between phases, so a phase already in flight finishes first.
  ipcMain.handle('spine:abort', async (_, sessionId: string): Promise<boolean> => {
    const controller = activeRuns.get(sessionId);
    if (!controller) return false;
    controller.abort();
    activeChannels.get(sessionId)?.cancelAll('Stopped by user');
    return true;
  });

  ipcMain.handle('spine:start', async (event, task: string, mode?: 'auto' | 'guided'): Promise<{ sessionId: string }> => {
    if (typeof task !== 'string' || !task.trim() || task.length > 10000) {
      throw new Error('Task prompt must be a non-empty string under 10000 characters');
    }
    if (activeRuns.size > 0) throw new Error('A spine run is already active. Stop it before starting another run.');
    await applyAiConfigToRuntime(await loadAiConfig());
    const webContents = event.sender;
    const loop = new GuardrailLoop();
    const session = await loop.createSession(task);
    const sessionId = session.id;
    const hitlChannel = new DesktopHitlChannel(webContents, sessionId);
    activeChannels.set(sessionId, hitlChannel);
    const controller = new AbortController();
    const { signal } = controller;
    activeRuns.set(sessionId, controller);

    (async () => {
      try {
        const store = new SessionStore(join(storageRoot, '.aix', 'sessions'));
        let engineState = createInitialEngineState(session);
        await store.save(engineState);

        const emitLog = (msg: string) => {
          if (!webContents.isDestroyed()) {
            webContents.send('spine:event', {
              type: 'log',
              sessionId,
              message: msg,
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        };

        const emitPhase = (p: Phase) => {
          if (!webContents.isDestroyed()) {
            webContents.send('spine:event', {
              type: 'phase',
              sessionId,
              phase: p,
            });
          }
        };

        emitLog(`Started new session ${sessionId} for task: "${task}"`);

        // Phase 1: Discuss
        signal.throwIfAborted();
        emitPhase('discuss');
        emitLog('Executing Step 1: Discussing architecture and trade-offs...');
        engineState = await discussNode(engineState);
        await store.save(engineState);
        emitLog('Generated DISCUSSION.md artifact');

        if (mode === 'guided') {
          let proceed = false;
          while (!proceed) {
            const resp = await hitlChannel.ask({
              question: 'Proceed to Planning phase?',
              options: [
                { id: 'approve', label: 'Approve', summary: 'Proceed to Plan' },
                { id: 'revise', label: 'Revise', summary: 'Request adjustments to Discussion' },
                { id: 'cancel', label: 'Cancel', summary: 'Abort spine execution' },
              ],
              tier: 0,
            });
            if (resp.chosen === 'cancel') {
              emitLog('Session cancelled by user');
              controller.abort();
            }
            signal.throwIfAborted();
            if (resp.chosen === 'revise') {
              emitLog(`Revision requested: ${resp.note ?? 're-evaluating discussion'}`);
              engineState = await discussNode(engineState);
              await store.save(engineState);
            } else {
              proceed = true;
            }
          }
        }

        // Phase 2: Plan
        signal.throwIfAborted();
        emitPhase('plan');
        emitLog('Executing Step 2: Planning tasks and acceptance criteria...');
        engineState = await planNode(engineState);
        await store.save(engineState);
        emitLog(`Generated PLAN.md artifact with ${engineState.tasks.length} task(s)`);

        if (mode === 'guided') {
          let proceed = false;
          while (!proceed) {
            const resp = await hitlChannel.ask({
              question: 'Approve execution plan?',
              options: [
                { id: 'approve', label: 'Approve', summary: 'Proceed to TDD & Execution' },
                { id: 'revise', label: 'Revise', summary: 'Request adjustments to Plan' },
                { id: 'cancel', label: 'Cancel', summary: 'Abort spine execution' },
              ],
              tier: 0,
            });
            if (resp.chosen === 'cancel') {
              emitLog('Session cancelled by user');
              controller.abort();
            }
            signal.throwIfAborted();
            if (resp.chosen === 'revise') {
              emitLog(`Revision requested: ${resp.note ?? 're-evaluating plan'}`);
              engineState = await planNode(engineState);
              await store.save(engineState);
            } else {
              proceed = true;
            }
          }
        }

        // Phase 3: Run / Execution
        signal.throwIfAborted();
        emitPhase('run');
        emitLog('Generating implementation and running the engine quality heuristic. Worktree isolation, test-first execution, and verification are not run by this desktop runner.');
        const graph = new EngineGraph(store);
        engineState = await graph.run(engineState);
        await store.save(engineState);
        emitLog(`Generation finished. Output review heuristic: ${engineState.reviewScore ?? 'unavailable'}/10; executable verification was not run.`);

        signal.throwIfAborted();
        const sessionFolder = join(storageRoot, '.aix', 'sessions', sessionId);
        const reviewPath = join(sessionFolder, 'REVIEW.md');
        await writeFile(reviewPath, [
          '# Generated Output Review',
          '',
          `Heuristic score: ${engineState.reviewScore ?? 'unavailable'}/10`,
          '',
          'This is a text-quality heuristic only. It is not a security audit and does not prove that generated code compiles or passes tests.',
          '',
          'Executable verification: NOT RUN. Use the Verify page after reviewing the generated files.',
          '',
        ].join('\n'), 'utf-8');
        const files = await readdir(sessionFolder).catch(() => []);
        const artifacts = files.filter(f => f.endsWith('.md'));

        if (!webContents.isDestroyed()) {
          webContents.send('spine:event', {
            type: 'complete',
            sessionId,
            checkpointId: sessionId,
            artifacts,
            generatedFilesCount: engineState.writtenFiles?.length ?? 0,
          });
        }
      } catch (err: unknown) {
        if (signal.aborted) {
          if (!webContents.isDestroyed()) {
            webContents.send('spine:event', { type: 'aborted', sessionId });
          }
        } else if (!webContents.isDestroyed()) {
          webContents.send('spine:event', {
            type: 'error',
            sessionId,
            error: String(err),
          });
        }
      } finally {
        activeChannels.delete(sessionId);
        activeRuns.delete(sessionId);
      }
    })();

    return { sessionId };
  });

  async function persistVerificationResult(sessionId: string, command: string, result: DesktopVerificationResult): Promise<void> {
    const store = new SessionStore(join(storageRoot, '.aix', 'sessions'));
    const state = await store.load(sessionId);
    if (!state) throw new Error(`Session ${sessionId} was not found while saving verification evidence`);

    const checkedAt = new Date().toISOString();
    const verifyPath = join(storageRoot, '.aix', 'sessions', sessionId, 'VERIFY.md');
    const output = redactStrings(`${result.stdout}${result.stderr}`);
    const status = result.ok ? 'passed' as const : 'failed' as const;
    await writeFile(verifyPath, [
      '# Verification Run',
      '',
      `Status: ${status.toUpperCase()}`,
      `Command: ${redactStrings(command)}`,
      `Checked at: ${checkedAt}`,
      `Exit code: ${result.exitCode}`,
      `Generated files observed: ${result.generatedFilesCount}`,
      '',
      'This records the supplied test command result only; it is not proof that every acceptance criterion passed.',
      '',
      '## Output',
      '',
      '```text',
      output,
      '```',
      '',
    ].join('\n'), 'utf-8');
    await store.save({
      ...state,
      session: {
        ...state.session,
        phase: 'verify',
        evidence: [
          ...state.session.evidence.filter(entry => entry.phase !== 'verify'),
          {
            phase: 'verify',
            kind: result.ok ? 'artifact' : 'eval',
            summary: result.ok ? 'User-selected verification command exited successfully' : 'User-selected verification command failed',
            at: checkedAt,
            ref: verifyPath,
          },
        ],
      },
      verification: {
        status,
        command: redactStrings(command),
        cwd: join(dirname(verifyPath), 'generated'),
        exitCode: result.exitCode,
        output,
        checkedAt,
        files: {},
      },
    });
  }

  // Commands run with the current user's OS permissions; generated/ is a working directory, not an OS sandbox.
  ipcMain.handle('verify:run', async (_, sessionId: string, command: string): Promise<DesktopVerificationResult> => {
    if (!/^[a-zA-Z0-9_-]+$/.test(sessionId) || !command.trim()) {
      return {
        ok: false,
        exitCode: 1,
        command,
        stdout: '',
        stderr: 'Invalid sessionId or empty command',
        durationMs: 0,
        generatedFilesCount: 0,
      };
    }

    const validation = validateVerificationCommand(command);
    if (!validation.ok) {
      return {
        ok: false,
        exitCode: 1,
        command,
        stdout: '',
        stderr: `Blocked: ${validation.error}`,
        durationMs: 0,
        generatedFilesCount: 0,
      };
    }
    const sessionDir = resolve(storageRoot, '.aix', 'sessions', sessionId);
    const generatedDir = join(sessionDir, 'generated');

    // Security check: denylist command check
    const check = policy.checkShell(command);
    if (!check.ok) {
      return {
        ok: false,
        exitCode: 1,
        command,
        stdout: '',
        stderr: `Blocked by aix policy: ${check.error.message}`,
        durationMs: 0,
        generatedFilesCount: 0,
      };
    }

    let filesCount = 0;
    try {
      const files = await readdir(generatedDir);
      filesCount = files.length;
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return {
          ok: false,
          exitCode: 1,
          command,
          stdout: '',
          stderr: `Generated output does not exist for session ${sessionId}`,
          durationMs: 0,
          generatedFilesCount: 0,
        };
      }
      throw error;
    }

    // Confirmation happens in the renderer with an in-app dialog before this
    // IPC is invoked; the main process never shows native dialogs here.

    const start = Date.now();
    let result: DesktopVerificationResult;
    try {
      const { stdout, stderr } = await execFileAsync(validation.binaryName, validation.args, {
        cwd: generatedDir,
        shell: false,
        timeout: 30000,
        maxBuffer: 4 * 1024 * 1024,
      });
      result = {
        ok: true,
        exitCode: 0,
        command,
        stdout: redactStrings(stdout),
        stderr: redactStrings(stderr),
        durationMs: Date.now() - start,
        generatedFilesCount: filesCount,
      };
    } catch (err: unknown) {
      const errorObj = err && typeof err === 'object' ? (err as Record<string, unknown>) : {};
      const exitCode = typeof errorObj['code'] === 'number' ? errorObj['code'] : 1;
      const stdout = redactStrings(typeof errorObj['stdout'] === 'string' ? errorObj['stdout'] : '');
      const stderr = redactStrings(typeof errorObj['stderr'] === 'string' ? errorObj['stderr'] : String(err));
      result = {
        ok: false,
        exitCode,
        command,
        stdout,
        stderr,
        durationMs: Date.now() - start,
        generatedFilesCount: filesCount,
      };
    }
    await persistVerificationResult(sessionId, command, result);
    return result;
  });
}
