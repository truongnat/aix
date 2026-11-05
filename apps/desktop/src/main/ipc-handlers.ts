import { app, dialog, ipcMain } from 'electron';
import { readdir, readFile, stat, unlink, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve, relative, isAbsolute, dirname } from 'node:path';
import { homedir } from 'node:os';
import { exec, execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { SkillRegistry } from '@x/registry';
import { MarkdownStore, RedactedMemoryStore } from '@x/memory';
import { PolicyEngine } from '@x/policy';
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
  AiProviderId,
} from '../shared/api.js';

const execFileAsync = promisify(execFile);

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

  async function loadAiConfig(): Promise<{ provider: AiProviderId; model: string; apiKey: string; baseUrl?: string }> {
    try {
      const raw = await readFile(aiConfigFile, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        provider: parsed.provider ?? 'anthropic',
        model: parsed.model ?? 'claude-3-5-sonnet-20241022',
        apiKey: parsed.apiKey ?? process.env['ANTHROPIC_API_KEY'] ?? process.env['OPENAI_API_KEY'] ?? process.env['GROQ_API_KEY'] ?? '',
        baseUrl: parsed.baseUrl,
      };
    } catch {
      let ompKey = '';
      let ompUrl = '';
      try {
        const ompYml = await readFile(join(homedir(), '.omp', 'agent', 'models.yml'), 'utf-8');
        const keyMatch = ompYml.match(/apiKey:\s*([^\s\r\n]+)/);
        const urlMatch = ompYml.match(/baseUrl:\s*([^\s\r\n]+)/);
        if (keyMatch?.[1]) ompKey = keyMatch[1];
        if (urlMatch?.[1]) ompUrl = urlMatch[1];
      } catch {
        // no omp models.yml
      }

      if (ompKey) {
        return {
          provider: 'inferx',
          model: 'deepseek-v4.1-flash-1017-basic',
          apiKey: ompKey,
          baseUrl: ompUrl || 'https://model.inferx.net/endpoints/v1',
        };
      }

      return {
        provider: (process.env['AIX_PROVIDER'] as AiProviderId) ?? 'anthropic',
        model: process.env['ANTHROPIC_MODEL'] ?? 'claude-3-5-sonnet-20241022',
        apiKey: process.env['ANTHROPIC_API_KEY'] ?? process.env['OPENAI_API_KEY'] ?? process.env['GROQ_API_KEY'] ?? '',
        baseUrl: undefined,
      };
    }
  }

  async function checkKbHealth(): Promise<{ online: boolean; port: number; url: string }> {
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
    };
  });

  ipcMain.handle('ai:setConfig', async (_, newConfig: { provider: AiProviderId; model: string; apiKey?: string; baseUrl?: string }) => {
    const existing = await loadAiConfig();
    const finalApiKey = newConfig.apiKey?.trim() ? newConfig.apiKey.trim() : existing.apiKey;
    const finalConfig = {
      provider: newConfig.provider,
      model: newConfig.model.trim(),
      apiKey: finalApiKey,
      baseUrl: newConfig.baseUrl?.trim() || undefined,
    };

    await mkdir(dirname(aiConfigFile), { recursive: true });
    await writeFile(aiConfigFile, JSON.stringify(finalConfig, null, 2), 'utf-8');

    process.env['AIX_PROVIDER'] = finalConfig.provider;
    if (finalConfig.apiKey) {
      if (finalConfig.provider === 'anthropic') {
        process.env['ANTHROPIC_API_KEY'] = finalConfig.apiKey;
        process.env['ANTHROPIC_MODEL'] = finalConfig.model;
      } else if (finalConfig.provider === 'openai') {
        process.env['OPENAI_API_KEY'] = finalConfig.apiKey;
        process.env['OPENAI_MODEL'] = finalConfig.model;
      } else if (finalConfig.provider === 'groq') {
        process.env['GROQ_API_KEY'] = finalConfig.apiKey;
        process.env['GROQ_MODEL'] = finalConfig.model;
      }
    }

    return { ok: true };
  });

  ipcMain.handle('ai:testConnection', async (_, testParams?: { provider: AiProviderId; model: string; apiKey?: string; baseUrl?: string }): Promise<DesktopTestConnectionResult> => {
    const current = await loadAiConfig();
    const provider = testParams?.provider ?? current.provider;
    const model = testParams?.model ?? current.model;
    const apiKey = testParams?.apiKey?.trim() ? testParams.apiKey.trim() : current.apiKey;
    const baseUrl = testParams?.baseUrl?.trim() ? testParams.baseUrl.trim() : current.baseUrl;

    if (provider === 'mock') {
      return { ok: true, latencyMs: 5, message: 'Mock provider active (offline mode)' };
    }

    if (!apiKey && provider !== 'ollama') {
      return { ok: false, latencyMs: 0, message: 'Missing API Key', error: `Missing API Key for provider "${provider}"` };
    }

    const start = Date.now();
    try {
      if (provider === 'anthropic') {
        const url = baseUrl || 'https://api.anthropic.com/v1/messages';
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
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
    if (app && app.isPackaged) {
      return {
        ok: false,
        message: 'Standalone KB service management via pnpm is only available in development mode. In production, run the standalone KB container or service.',
      };
    }

    async function getMasterPassword(): Promise<string> {
      try {
        return (await readFile(kbPasswordFile, 'utf-8')).trim();
      } catch {
        const generated = 'aix-kb-master-' + crypto.randomUUID().slice(0, 8);
        await mkdir(dirname(kbPasswordFile), { recursive: true });
        await writeFile(kbPasswordFile, generated, 'utf-8');
        return generated;
      }
    }

    if (action === 'start') {
      const currentHealth = await checkKbHealth();
      if (currentHealth.online) {
        return { ok: true, message: `KB Service is already running at ${currentHealth.url}` };
      }

      const masterPassword = await getMasterPassword();
      const kbMain = join(repoRoot, 'services', 'kb-server', 'dist', 'main.js');

      try {
        const child = spawn(process.execPath, [kbMain], {
          detached: true,
          stdio: 'ignore',
          cwd: repoRoot,
          env: {
            ...process.env,
            PORT: '4000',
            KB_HOST: '127.0.0.1',
            KB_MASTER_PASSWORD: masterPassword,
          },
        });
        child.unref();

        // Poll health up to 4.5 seconds
        const start = Date.now();
        while (Date.now() - start < 4500) {
          await new Promise(r => setTimeout(r, 400));
          const h = await checkKbHealth();
          if (h.online) {
            return { ok: true, message: `KB Server launched successfully on http://127.0.0.1:${h.port}!` };
          }
        }

        return { ok: false, message: 'KB Server was spawned but health check timed out. Verify services/kb-server/dist/main.js' };
      } catch (err: unknown) {
        return { ok: false, message: `Failed to spawn KB server: ${String(err)}` };
      }
    } else {
      const masterPassword = await getMasterPassword();
      try {
        await fetch('http://127.0.0.1:4000/shutdown', {
          method: 'POST',
          headers: { 'x-master-password': masterPassword },
          signal: AbortSignal.timeout(2000),
        }).catch(() => {});
        return { ok: true, message: 'KB Service shutdown signal sent' };
      } catch (err: unknown) {
        return { ok: false, message: String(err) };
      }
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
        emitLog('Executing Step 4 & 5: Running tasks in sandbox with TDD & Coder...');
        const graph = new EngineGraph(store);
        engineState = await graph.run(engineState);
        await store.save(engineState);
        emitLog(`Execution completed with score: ${engineState.reviewScore}/10`);

        // Phase 4: Verify
        signal.throwIfAborted();
        emitPhase('verify');
        emitLog('Generated REVIEW.md and prepared sandbox for verification');

        signal.throwIfAborted();
        const sessionFolder = join(storageRoot, '.aix', 'sessions', sessionId);
        const files = await readdir(sessionFolder).catch(() => []);
        const artifacts = files.filter(f => f.endsWith('.md'));

        if (!webContents.isDestroyed()) {
          webContents.send('spine:event', {
            type: 'complete',
            sessionId,
            checkpointId: sessionId,
            artifacts,
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

  // Verification Runner in Sandbox
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
    } catch {
      return {
        ok: false,
        exitCode: 1,
        command,
        stdout: '',
        stderr: `Generated sandbox does not exist for session ${sessionId}`,
        durationMs: 0,
        generatedFilesCount: 0,
      };
    }

    const start = Date.now();
    try {
      const { stdout, stderr } = await execFileAsync(validation.binaryName, validation.args, {
        cwd: generatedDir,
        shell: false,
        timeout: 30000,
        maxBuffer: 4 * 1024 * 1024,
      });
      return {
        ok: true,
        exitCode: 0,
        command,
        stdout,
        stderr,
        durationMs: Date.now() - start,
        generatedFilesCount: filesCount,
      };
    } catch (err: unknown) {
      const errorObj = err && typeof err === 'object' ? (err as Record<string, unknown>) : {};
      const exitCode = typeof errorObj['code'] === 'number' ? errorObj['code'] : 1;
      const stdout = typeof errorObj['stdout'] === 'string' ? errorObj['stdout'] : '';
      const stderr = typeof errorObj['stderr'] === 'string' ? errorObj['stderr'] : String(err);
      return {
        ok: false,
        exitCode,
        command,
        stdout,
        stderr,
        durationMs: Date.now() - start,
        generatedFilesCount: filesCount,
      };
    }
  });
}
