import { Command } from 'commander';
import { existsSync } from 'node:fs';
import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';

const AGENTS_SECTION = `## aix

This project uses [aix](https://github.com/truongnat/aix): an engineering spine + skill library for coding agents.

- Session artifacts (DISCUSSION.md, PLAN.md, REVIEW.md, VERIFY.md, REMEMBER.md) go in \`.aix/sessions/<session-id>/\` — never \`.planning/\` or other harness dirs.
- Spine: discuss → plan → isolate → test-first → execute → review → verify → remember.
- Memory: \`.aix/memory/\` via \`aix memory push|search|list\`.
`;

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize aix in the current project (.aix/ dirs + AGENTS.md section)')
    .action(async () => {
      const cwd = process.cwd();
      const sessions = join(cwd, '.aix', 'sessions');
      const memory = join(cwd, '.aix', 'memory');
      await mkdir(sessions, { recursive: true });
      await mkdir(memory, { recursive: true });
      console.log('  + .aix/sessions/');
      console.log('  + .aix/memory/');

      const agentsPath = join(cwd, 'AGENTS.md');
      if (existsSync(agentsPath)) {
        await appendFile(agentsPath, `\n${AGENTS_SECTION}`, 'utf-8');
        console.log('  ~ AGENTS.md (appended aix section)');
      } else {
        await writeFile(agentsPath, `# Project\n\n${AGENTS_SECTION}`, 'utf-8');
        console.log('  + AGENTS.md');
      }

      console.log('\nDone. Install skills/providers with: aix install --all');
    });
}
