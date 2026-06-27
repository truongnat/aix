import { Command } from 'commander';
import { MarkdownStore, RedactedMemoryStore } from '@x/memory';
import { PolicyEngine } from '@x/policy';
import type { MemoryRecord } from '@x/memory';
const VALID_KINDS: readonly MemoryRecord['kind'][] = ['solution', 'decision', 'prompt-template', 'evidence'];

function parseKind(raw: string | undefined): MemoryRecord['kind'] {
  if (raw && (VALID_KINDS as readonly string[]).includes(raw)) {
    return raw as MemoryRecord['kind'];
  }
  return 'decision';
}

function createRedactedStore(baseDir: string): RedactedMemoryStore {
  const policy = new PolicyEngine();
  const inner = new MarkdownStore(baseDir);
  return new RedactedMemoryStore(inner, policy);
}

export function registerMemoryCommand(program: Command): void {
  const memory = program.command('memory');

  memory
    .command('push')
    .argument('<title>', 'Memory title')
    .argument('<body>', 'Memory body')
    .option('--kind <kind>', 'Kind: solution|decision|prompt-template|evidence')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(async (title: string, body: string, opts: { kind?: string; tags?: string }) => {
      const store = createRedactedStore(process.cwd());
      await store.push({
        id: crypto.randomUUID(),
        kind: parseKind(opts.kind),
        title,
        body,
        tags: opts.tags?.split(',').map(t => t.trim()) ?? [],
        version: '0.1.0',
        createdAt: new Date().toISOString(),
      });
      console.log('Memory saved');
    });

  memory
    .command('list')
    .option('--kind <kind>', 'Filter by kind')
    .action(async (opts: { kind?: string }) => {
      const store = createRedactedStore(process.cwd());
      const kind = opts.kind ? parseKind(opts.kind) : undefined;
      const records = await store.list(kind ? { kind } : undefined);
      for (const r of records) {
        console.log(`  ${r.id.slice(0, 8)}  ${r.title}  (${r.kind})`);
      }
      console.log(`\n  ${records.length} memories`);
    });

  memory
    .command('search <query>')
    .action(async (query: string) => {
      const store = createRedactedStore(process.cwd());
      const results = await store.search(query);
      for (const r of results) {
        console.log(`  ${r.id.slice(0, 8)}  ${r.title}`);
      }
      console.log(`\n  ${results.length} results`);
    });
}
