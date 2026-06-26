import { Command } from 'commander';

export function registerKbCommand(program: Command): void {
  const kb = program.command('kb');

  kb
    .command('status')
    .description('Check kb-server status')
    .action(async () => {
      try {
        const res = await fetch('http://localhost:4000/health');
        if (res.ok) {
          console.log('kb-server: online');
        } else {
          console.log('kb-server: error');
        }
      } catch {
        console.log('kb-server: unreachable (start with: docker compose up)');
      }
    });

  kb
    .command('query')
    .argument('<query>', 'Graph query')
    .action(async (query: string) => {
      try {
        const res = await fetch('http://localhost:4000/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
      } catch {
        console.error('kb-server unreachable');
        process.exit(1);
      }
    });
}
