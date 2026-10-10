import { Command } from 'commander';
import { statSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SkillRegistry, migrateSkills } from '@x/registry';
import { PolicyEngine } from '@x/policy';

export function findRepoRoot(): string {
  const dir = fileURLToPath(new URL('.', import.meta.url));
  // dir = packages/cli/dist → repo root is 3 levels up (dist→cli→packages→root)
  const candidates = [
    join(dir, '..', '..', '..'),
    process.cwd(),
  ];
  for (const c of candidates) {
    try {
      statSync(join(c, 'skills'));
      return c;
    } catch {
      continue;
    }
  }
  return join(dir, '..', '..', '..');
}

export function registerSkillsCommand(program: Command): void {
  const skills = program.command('skills');

  skills
    .command('validate')
    .description('Validate all SKILL.md frontmatter')
    .action(async () => {
      const registry = await SkillRegistry.load(findRepoRoot());
      const errors = registry.validateAll();
      const warnings = errors.filter(e => e.code === 'WARN');
      const fatal = errors.filter(e => e.code !== 'WARN');
      const total = registry.all().length;

      for (const w of warnings) {
        console.warn(`  WARN: ${w.message}`);
      }
      for (const e of fatal) {
        console.error(`  ERROR: ${e.message}`);
      }

      if (fatal.length > 0) {
        console.error(`\n  ${fatal.length} error(s), ${warnings.length} warning(s) — ${total} skills checked`);
        process.exit(1);
      }

      console.log(`  ${total} skills valid${warnings.length > 0 ? `, ${warnings.length} warning(s)` : ''}`);
    });

  skills
    .command('list')
    .description('List all skills')
    .option('--kind <kind>', 'Filter by kind: domain|process|reference')
    .option('--role <role>', 'Filter by role: planner|coder|reviewer|architect')
    .action(async (opts: { kind?: string; role?: string }) => {
      const registry = await SkillRegistry.load(findRepoRoot());
      let skills = registry.all();

      if (opts.kind) {
        skills = skills.filter(s => s.meta.kind === opts.kind);
      }
      if (opts.role) {
        skills = skills.filter(s => s.meta.roles.includes(opts.role));
      }

      const catalog = registry.toCatalog();
      console.table(catalog.map(s => ({
        name: s.name,
        kind: s.kind,
        version: s.version,
        roles: s.roles.join(','),
        compatible: s.compatible.join(','),
      })));

      await writeFile('catalog.json', JSON.stringify(catalog, null, 2), 'utf-8');
      console.log(`catalog.json written (${catalog.length} skills)`);
    });

  skills
    .command('show <name>')
    .description('Show skill details')
    .action(async (name: string) => {
      const registry = await SkillRegistry.load(findRepoRoot());
      const skill = registry.get(name);
      if (!skill) {
        console.error(`Skill "${name}" not found`);
        process.exit(1);
      }
      console.log(`  Description: ${skill.frontmatter.description}`);
      console.log(`  Kind:        ${skill.meta.kind}`);
      console.log(`  Version:     ${skill.meta.version}`);
      console.log(`  Tags:        ${skill.meta.tags.join(', ')}`);
      console.log(`  Roles:       ${skill.meta.roles.join(', ')}`);
      console.log(`  Compatible:  ${skill.meta.compatible.join(', ')}`);
      console.log(`  Body:        ~${skill.bodyTokenEstimate} tokens`);
    });

  skills
    .command('migrate')
    .description('Migrate external skill dirs into skills/ (imports/ or any source)')
    .option('--write', 'Write files (default: dry-run only)')
    .option('--from <dirs...>', 'Source dirs to scan (default: legacy imports/ paths)')
    .action(async (opts: { write?: boolean; from?: string[] }) => {
      const report = await migrateSkills({
        sources: opts.from ?? ['imports/skills/skills', 'imports/system-design-skills', 'imports/ai-engineering-harness/skills', 'imports/dev-memory/skills'],
        outDir: 'skills',
        ...(opts.write ? { write: true, policyEngine: new PolicyEngine() } : {}),
      });

      console.log(`Converted: ${report.converted.length} skills`);
      for (const c of report.converted) {
        console.log(`  ${c.from} → ${c.to}`);
      }
      if (report.duplicates.length > 0) {
        console.log(`Duplicates: ${report.duplicates.length}`);
        for (const d of report.duplicates) {
          console.log(`  ${d.name}: ${d.sources.join(', ')}`);
        }
      }
      if (report.dropped.length > 0) {
        console.log(`Dropped: ${report.dropped.length}`);
        for (const d of report.dropped) {
          console.log(`  ${d.name} — ${d.reason}`);
        }
      }
      if (report.errors.length > 0) {
        console.log(`Errors: ${report.errors.length}`);
        for (const e of report.errors) {
          console.log(`  ${e.code}: ${e.message}`);
        }
      }

      if (opts.write) {
        const registry = await SkillRegistry.load(process.cwd());
        const catalog = registry.toCatalog();
        await writeFile('catalog.json', JSON.stringify(catalog, null, 2), 'utf-8');
        console.log(`catalog.json written (${catalog.length} skills)`);
      }
    });
}
