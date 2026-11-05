import { ipcMain } from 'electron';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { SkillRegistry } from '@x/registry';
import { MarkdownStore, RedactedMemoryStore } from '@x/memory';
import { PolicyEngine } from '@x/policy';
import type { SkillCategory, Phase } from '@x/core';
import type {
  DesktopSkillSummary,
  DesktopSkillDetail,
  DesktopMemoryRecord,
  DesktopSessionSummary,
  DesktopVerificationResult,
  DesktopSystemStatus,
} from '../shared/api.js';

const execAsync = promisify(exec);

export function registerIpcHandlers(repoRoot: string): void {
  const policy = new PolicyEngine();
  const memoryStore = new RedactedMemoryStore(new MarkdownStore(repoRoot), policy);
  let cachedRegistry: SkillRegistry | null = null;

  async function getRegistry(): Promise<SkillRegistry> {
    if (!cachedRegistry) {
      cachedRegistry = await SkillRegistry.load(repoRoot);
    }
    return cachedRegistry;
  }

  // System Status
  ipcMain.handle('system:getStatus', async (): Promise<DesktopSystemStatus> => {
    const registry = await getRegistry();
    const memories = await memoryStore.list();
    let kbOnline = false;
    try {
      const res = await fetch('http://127.0.0.1:3001/health', { signal: AbortSignal.timeout(1000) });
      kbOnline = res.ok;
    } catch {
      kbOnline = false;
    }

    return {
      appVersion: '0.1.0',
      nodeVersion: process.version,
      platform: process.platform,
      cwd: repoRoot,
      skillsCount: registry.all().length,
      memoryCount: memories.length,
      kbServiceOnline: kbOnline,
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

  // Sessions & Spine
  ipcMain.handle('spine:listSessions', async (): Promise<readonly DesktopSessionSummary[]> => {
    const sessionsDir = join(repoRoot, '.aix', 'sessions');
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
    // Sanitize path
    const safeArtifact = artifactName.replace(/[^A-Za-z0-9_.-]/g, '');
    const artifactPath = resolve(repoRoot, '.aix', 'sessions', sessionId, safeArtifact);
    const expectedDir = resolve(repoRoot, '.aix', 'sessions', sessionId);
    if (!artifactPath.startsWith(expectedDir)) return undefined;

    try {
      return await readFile(artifactPath, 'utf-8');
    } catch {
      return undefined;
    }
  });

  // Verification Runner in Sandbox
  ipcMain.handle('verify:run', async (_, sessionId: string, command: string): Promise<DesktopVerificationResult> => {
    const sessionDir = resolve(repoRoot, '.aix', 'sessions', sessionId);
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
      const { stdout, stderr } = await execAsync(command, {
        cwd: generatedDir,
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
