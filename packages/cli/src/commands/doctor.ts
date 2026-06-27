import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Check environment and configuration')
    .action(async () => {
      let ok = true;

      const nodeVersion = process.version;
      const major = parseInt(nodeVersion.slice(1).split('.')[0]!, 10);
      if (major >= 22) {
        console.log(`  Node: ${nodeVersion}`);
      } else {
        console.error(`  Node: ${nodeVersion} (need >=22)`);
        ok = false;
      }

      try {
        execSync('pnpm --version', { stdio: 'pipe' });
        console.log('  pnpm: available');
      } catch {
        console.error('  pnpm: not found');
        ok = false;
      }

      const cwd = process.cwd();
      console.log(`  CWD:  ${cwd}`);

      try {
        const res = await fetch('http://localhost:4000/health');
        if (res.ok) {
          console.log('  KB: connected (Neo4j)');
        } else {
          console.log('  KB: optional (markdown fallback active) — server unhealthy');
        }
      } catch {
        console.log('  KB: optional (markdown fallback active)');
      }

      const hasRoot = existsSync(join(cwd, 'aix.json'));
      const hasDot = existsSync(join(cwd, '.aix', 'config.json'));
      if (hasRoot || hasDot) {
        const found = hasRoot ? 'aix.json' : '.aix/config.json';
        console.log(`  Config: ${found}`);
      } else {
        console.error('  Config: not found (looked for aix.json or .aix/config.json)');
        ok = false;
      }

      const contentDir = join(cwd, 'content');
      if (existsSync(contentDir)) {
        try {
          execSync('ls', { cwd: contentDir, stdio: 'pipe' });
          console.log(`  Dry-run: content/ readable (${contentDir})`);
        } catch {
          console.error('  Dry-run: content/ exists but not readable');
          ok = false;
        }
      } else {
        console.log('  Dry-run: content/ not found (skipping compile check)');
      }

      if (ok) {
        console.log('System OK');
      } else {
        console.error('Issues found');
        process.exit(1);
      }
    });
}
