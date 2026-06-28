import { Command } from 'commander';
import { join } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { ContextEngine } from '@x/context';
import { SimpleVectorStore } from '@x/context';

const INDEX_FILE = '.aix/runtime/context-index.json';

function getIndexPath(cwd: string): string {
  return join(cwd, INDEX_FILE);
}

async function saveIndex(engine: ContextEngine, cwd: string): Promise<void> {
  const store = (engine as any).vectorStore;
  if (!(store instanceof SimpleVectorStore)) return;
  const dir = join(cwd, '.aix');
  await mkdir(dir, { recursive: true });
  await writeFile(getIndexPath(cwd), JSON.stringify(store.toJSON(), null, 2), 'utf-8');
}

async function loadIndex(cwd: string): Promise<ContextEngine> {
  const engine = await ContextEngine.create();
  const indexPath = getIndexPath(cwd);
  if (existsSync(indexPath)) {
    const raw = await readFile(indexPath, 'utf-8');
    const data = JSON.parse(raw) as { id: string; content: string; embedding: number[] }[];
    const store = SimpleVectorStore.fromJSON(data);
    engine as any;
    // Replace vector store by re-creating engine with loaded store
    return ContextEngine.create({ vectorStore: store });
  }
  return engine;
}

export function registerContextCommand(program: Command): void {
  const context = program.command('context');

  context
    .command('build [path]')
    .description('Analyze project and build context index')
    .action(async (path?: string) => {
      const projectPath = path ?? process.cwd();
      const engine = await ContextEngine.create();
      const analysis = await engine.build(projectPath);
      await engine.index(analysis);

      const funcCount = analysis.files.reduce((s, f) => s + f.functions.length, 0);
      const clsCount = analysis.files.reduce((s, f) => s + f.classes.length, 0);

      await saveIndex(engine, process.cwd());

      console.log(`Analyzed ${analysis.files.length} files`);
      console.log(`  Functions: ${funcCount}`);
      console.log(`  Classes:   ${clsCount}`);
      console.log(`  APIs:      ${analysis.apis.length}`);
      console.log(`  Flows:     ${analysis.flows.length}`);
      console.log(`Index saved to ${INDEX_FILE}`);
    });

  context
    .command('query <q>')
    .description('Query indexed context')
    .option('-k, --top <n>', 'Number of results', '5')
    .action(async (q: string, opts: { top?: string }) => {
      const k = parseInt(opts.top ?? '5', 10);
      const engine = await loadIndex(process.cwd());
      const results = await engine.query(q, k);

      if (results.length === 0) {
        console.log('No results found. Run `aix context build` first.');
        return;
      }

      for (const hit of results) {
        console.log(`[${hit.score.toFixed(4)}] ${hit.file}`);
        const preview = hit.content.slice(0, 150).replace(/\n/g, ' ').trim();
        console.log(`    ${preview}${hit.content.length > 150 ? '…' : ''}`);
        console.log();
      }
    });
}
