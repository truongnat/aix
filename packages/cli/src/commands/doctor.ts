import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
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

      // stale-skill check: repo ships skills-release.json {name: sha256}
      const manifestPath = join(cwd, 'skills-release.json');
      if (existsSync(manifestPath) && existsSync(join(cwd, 'skills'))) {
        try {
          const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as Record<string, string>;
          const stale: string[] = [];
          for (const [name, sha] of Object.entries(manifest)) {
            const p = join(cwd, 'skills', name, 'SKILL.md');
            if (!existsSync(p)) continue;
            if (createHash('sha256').update(readFileSync(p)).digest('hex') !== sha) {
              stale.push(name);
            }
          }
          if (stale.length > 0) {
            console.warn(`  Skills: ${stale.length} stale vs skills-release.json (update recommended)`);
          } else {
            console.log(`  Skills: ${Object.keys(manifest).length} up-to-date`);
          }
        } catch {
          console.log('  Skills: manifest unreadable (skipped staleness check)');
        }
      }

      const hasRoot = existsSync(join(cwd, 'aix.json'));
      const hasDot = existsSync(join(cwd, '.aix', 'static', 'config.json'));
      if (hasRoot || hasDot) {
        const found = hasRoot ? 'aix.json' : '.aix/static/config.json';
        console.log(`  Config: ${found}`);
      } else {
        console.log('  Config: not found (optional — create aix.json to customize)');
      }

      const skillsDir = join(cwd, 'skills');
      if (existsSync(skillsDir)) {
        try {
          execSync('ls', { cwd: skillsDir, stdio: 'pipe' });
          console.log(`  Dry-run: skills/ readable (${skillsDir})`);
        } catch {
          console.error('  Dry-run: skills/ exists but not readable');
          ok = false;
        }
      } else {
        console.log('  Dry-run: skills/ not found (skipping compile check)');
      }

      if (ok) {
        console.log('System OK');
      } else {
        console.error('Issues found');
        process.exit(1);
      }
    });
}
