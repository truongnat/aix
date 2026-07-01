import { Command } from 'commander';
import { ensureKbServer, KB_URL } from '../kb-server-manager.js';

const HEALTH_ENDPOINT = `${KB_URL}/health`;

async function fetchHealth(): Promise<{ ok: boolean; data?: unknown }> {
  try {
    const res = await fetch(HEALTH_ENDPOINT, { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch {
    return { ok: false };
  }
}

export function registerKbCommand(program: Command): void {
  const kb = program.command('kb').description('Manage the local kb-server knowledge base');

  kb
    .command('status')
    .description('Show kb-server status')
    .action(async () => {
      const { ok, data } = await fetchHealth();
      if (ok) {
        console.log(`kb-server: online (${KB_URL})`);
        if (data) console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(`kb-server: offline — run "aix kb start" to launch`);
        process.exit(1);
      }
    });

  kb
    .command('ensure')
    .description('Start kb-server if not already running (used at session start)')
    .action(async () => {
      const url = await ensureKbServer();
      if (url) {
        console.log(`kb-server ready at ${url}`);
      } else {
        console.error('kb-server could not be started');
        process.exit(1);
      }
    });

  kb
    .command('start')
    .description('Alias for "ensure" — start kb-server if not running')
    .action(async () => {
      const url = await ensureKbServer();
      if (url) {
        console.log(`kb-server ready at ${url}`);
      } else {
        console.error('kb-server could not be started');
        process.exit(1);
      }
    });

  kb
    .command('stop')
    .description('Stop the kb-server')
    .action(async () => {
      const { shutdownKbServer } = await import('../kb-server-manager.js');
      await shutdownKbServer();
      console.log('kb-server stopped');
    });

  kb
    .command('search')
    .description('Search memory records')
    .argument('<query>', 'Search query')
    .option('-k, --limit <n>', 'Max results', '10')
    .action(async (query: string, opts: { limit: string }) => {
      const { ok } = await fetchHealth();
      if (!ok) {
        console.error('kb-server offline — run "aix kb start" first');
        process.exit(1);
      }
      const params = new URLSearchParams({ q: query, k: opts.limit });
      const res = await fetch(`${KB_URL}/api/v1/memory/search?${params}`);
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
    });

  kb
    .command('list')
    .description('List memory records')
    .option('--kind <kind>', 'Filter by kind')
    .action(async (opts: { kind?: string }) => {
      const { ok } = await fetchHealth();
      if (!ok) {
        console.error('kb-server offline — run "aix kb start" first');
        process.exit(1);
      }
      const params = new URLSearchParams();
      if (opts.kind) params.set('kind', opts.kind);
      const res = await fetch(`${KB_URL}/api/v1/memory?${params}`);
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
    });
}
