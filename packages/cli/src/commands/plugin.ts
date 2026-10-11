import { Command } from 'commander';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { findRepoRoot } from './skills.js';

export function registerPluginCommand(program: Command): void {
  program
    .command('plugin')
    .description('Emit provider manifests from the canonical plugin.json')
    .command('build')
    .option('--out <dir>', 'Output directory (default: repo root)', '.')
    .action(async (opts: { out: string }) => {
      const root = findRepoRoot();
      const canonical = JSON.parse(
        await readFile(join(root, 'plugin.json'), 'utf-8'),
      ) as Record<string, unknown>;

      const base = {
        name: canonical['name'],
        version: canonical['version'],
        description: canonical['description'],
        author: canonical['author'],
        homepage: canonical['homepage'],
        repository: canonical['repository'],
        license: canonical['license'],
        keywords: canonical['keywords'],
      };

      const manifests: Record<string, object> = {
        '.claude-plugin/plugin.json': {
          ...base,
          displayName: 'aix',
          skills: ['./skills/'],
          workflows: ['./workflows/'],
          experimental: { evals: './evals/' },
        },
        '.cursor-plugin/plugin.json': {
          ...base,
          displayName: 'aix',
          skills: './skills/',
        },
        'gemini-extension.json': {
          name: base.name,
          version: base.version,
          description: base.description,
          contextFileName: 'AGENTS.md',
        },
        '.claude-plugin/marketplace.json': {
          name: 'aix',
          description: base.description,
          owner: { name: 'truongdq', url: 'https://github.com/truongnat' },
          plugins: [{ name: 'aix', source: './', description: base.description }],
        },
      };

      for (const [rel, obj] of Object.entries(manifests)) {
        const target = join(opts.out, rel);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, JSON.stringify(obj, null, 2) + '\n', 'utf-8');
        console.log(`  + ${rel}`);
      }
    });
}
