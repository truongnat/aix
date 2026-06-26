import { Command } from 'commander';
import { statSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SkillRegistry } from '@x/registry';

function findContentRoot(): string {
  const dir = fileURLToPath(new URL('.', import.meta.url));
  const candidates = [
    join(process.cwd(), 'content'),
    join(process.cwd(), '..', 'content'),
    join(dir, '..', '..', '..', '..', 'content'),
  ];
  for (const c of candidates) {
    try {
      statSync(join(c, 'skills'));
      return c;
    } catch {
      continue;
    }
  }
  return join(process.cwd(), 'content');
}

export function registerSkillsCommand(program: Command): void {
  const skills = program.command('skills');

  skills
    .command('validate')
    .description('Validate all SKILL.md frontmatter')
    .action(async () => {
      const registry = await SkillRegistry.load(findContentRoot());
      const errors = registry.validateAll();
      if (errors.length === 0) {
        console.log('All skills valid');
        return;
      }
      for (const err of errors) {
        console.error(`  ${err.code}: ${err.message}`);
      }
      process.exit(1);
    });

  skills
    .command('list')
    .description('List all skills')
    .option('--kind <kind>', 'Filter by kind: domain|process|reference')
    .option('--role <role>', 'Filter by role: planner|coder|reviewer|architect')
    .action(async (opts: { kind?: string; role?: string }) => {
      const registry = await SkillRegistry.load(findContentRoot());
      let skills = registry.all();

      if (opts.kind) {
        skills = skills.filter(s => s.frontmatter['x-kind'] === opts.kind);
      }
      if (opts.role) {
        skills = skills.filter(s => s.frontmatter['x-roles'].includes(opts.role as any));
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
      const registry = await SkillRegistry.load(findContentRoot());
      const skill = registry.get(name);
      if (!skill) {
        console.error(`Skill "${name}" not found`);
        process.exit(1);
      }
      console.log(`  Description: ${skill.frontmatter.description}`);
      console.log(`  Kind:        ${skill.frontmatter['x-kind']}`);
      console.log(`  Version:     ${skill.frontmatter['x-version']}`);
      console.log(`  Tags:        ${skill.frontmatter['x-tags'].join(', ')}`);
      console.log(`  Roles:       ${skill.frontmatter['x-roles'].join(', ')}`);
      console.log(`  Compatible:  ${skill.frontmatter['x-compatible'].join(', ')}`);
      console.log(`  Body:        ~${skill.bodyTokenEstimate} tokens`);
    });
}
