import { Command } from 'commander';
import { statSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Provider } from '@x/core';
import { SkillRegistry } from '@x/registry';
import { ClaudeAdapter, CursorAdapter, CodexAdapter, GeminiAdapter } from '@x/providers';
import type { AgentDef, RuleDoc } from '@x/providers';
import { Compiler } from '@x/compiler';
import type { CompileOptions } from '@x/compiler';

const ADAPTERS: Record<Provider, ClaudeAdapter | CursorAdapter | CodexAdapter | GeminiAdapter> = {
  claude: new ClaudeAdapter(),
  cursor: new CursorAdapter(),
  codex: new CodexAdapter(),
  gemini: new GeminiAdapter(),
};

function findContentRoot(): string {
  const dir = fileURLToPath(new URL('.', import.meta.url));
  // dir = packages/cli/dist → repo root is 3 levels up (dist→cli→packages→root)
  const candidates = [
    join(dir, '..', '..', '..', 'content'),
    join(process.cwd(), 'content'),
  ];
  for (const c of candidates) {
    try {
      statSync(join(c, 'skills'));
      return c;
    } catch {
      continue;
    }
  }
  return join(dir, '..', '..', '..', 'content');
}

async function loadAgents(contentRoot: string): Promise<AgentDef[]> {
  const agentsDir = join(contentRoot, 'agents');
  const agents: AgentDef[] = [];
  try {
    const items = await readdir(agentsDir);
    for (const item of items) {
      if (!item.endsWith('.md')) continue;
      const fullPath = join(agentsDir, item);
      const content = await readFile(fullPath, 'utf-8');
      const name = item.replace(/\.md$/, '');
      const lines = content.split('\n');
      const description = lines.find(l => l.startsWith('description:'))?.slice('description:'.length).trim() ?? '';
      agents.push({ name, description, systemPrompt: content });
    }
  } catch {
    // no agents directory
  }
  return agents;
}

async function loadRules(contentRoot: string): Promise<RuleDoc[]> {
  const rulesDir = join(contentRoot, 'rules');
  const rules: RuleDoc[] = [];
  try {
    const categories = await readdir(rulesDir);
    for (const cat of categories) {
      const catPath = join(rulesDir, cat);
      const catStat = await stat(catPath);
      if (!catStat.isDirectory()) continue;
      const files = await readdir(catPath);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const fullPath = join(catPath, file);
        const content = await readFile(fullPath, 'utf-8');
        const name = file.replace(/\.md$/, '');
        rules.push({ name, content, priority: cat === 'core' ? 10 : 5 });
      }
    }
  } catch {
    // no rules directory
  }
  return rules;
}

export function registerInstallCommand(program: Command): void {
  program
    .command('install')
    .description('Install AI provider configuration')
    .option('--provider <provider>', 'Target provider: claude|cursor|codex|gemini')
    .option('--dry-run', 'Print plan without writing files')
    .option('--force', 'Overwrite user-edited files')
    .option('--all', 'Install for all providers')
    .action(async (opts: { provider?: string; dryRun?: boolean; force?: boolean; all?: boolean }) => {
      const providers: Provider[] = opts.all
        ? ['claude', 'cursor', 'codex', 'gemini']
        : opts.provider
          ? [opts.provider as Provider]
          : ['claude'];

      const contentRoot = findContentRoot();
      const registry = await SkillRegistry.load(contentRoot);
      const skills = registry.all();
      const catalog = registry.toCatalog();
      const agents = await loadAgents(contentRoot);
      const rules = await loadRules(contentRoot);

      const compiler = new Compiler(ADAPTERS);

      for (const provider of providers) {
        const copts: CompileOptions = {
          provider,
          targetRoot: process.cwd(),
          dryRun: opts.dryRun ?? false,
          force: opts.force ?? false,
        };

        const result = await compiler.compile({
          skills,
          catalog,
          agents,
          rules,
          mcpServers: [],
        }, copts);

        console.log(`\n[${provider}]`);
        console.log(`  Written:   ${result.written.length}`);
        console.log(`  Skipped:   ${result.skipped.length}`);
        console.log(`  Conflicts: ${result.conflicts.length}`);

        for (const p of result.written) {
          console.log(`    + ${p}`);
        }
        for (const p of result.skipped) {
          console.log(`    = ${p}`);
        }
        for (const p of result.conflicts) {
          console.log(`    ! ${p} (use --force to overwrite)`);
        }
      }
    });
}
