import { Command } from 'commander';
import { MarkdownStore } from '@x/memory';
import { join } from 'node:path';

export function registerMemoryCommand(program: Command): void {
  const memory = program.command('memory');

  memory
    .command('push')
    .argument('<title>', 'Memory title')
    .argument('<body>', 'Memory body')
    .option('--kind <kind>', 'Kind: solution|decision|prompt-template|evidence')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(async (title: string, body: string, opts: { kind?: string; tags?: string }) => {
      const store = new MarkdownStore(join(process.cwd(), '.ai'));
      await store.push({
        id: crypto.randomUUID(),
        kind: (opts.kind as any) ?? 'decision',
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
      const store = new MarkdownStore(join(process.cwd(), '.ai'));
      const records = await store.list(opts.kind ? { kind: opts.kind as any } : undefined);
      for (const r of records) {
        console.log(`  ${r.id.slice(0, 8)}  ${r.title}  (${r.kind})`);
      }
      console.log(`\n  ${records.length} memories`);
    });

  memory
    .command('search <query>')
    .action(async (query: string) => {
      const store = new MarkdownStore(join(process.cwd(), '.ai'));
      const results = await store.search(query);
      for (const r of results) {
        console.log(`  ${r.id.slice(0, 8)}  ${r.title}`);
      }
      console.log(`\n  ${results.length} results`);
    });
}
