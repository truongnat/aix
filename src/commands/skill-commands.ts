/**
 * Skill-related commands
 */

import chalk from 'chalk';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import matter from 'gray-matter';
import { listSkillDirs, readSkillInfo } from '../lib/skills.js';

export type ParsedArgs = {
  _?: string[];
  [key: string]: unknown;
};

const STRUCTURAL_SECTION_CHECKS = [
  { label: 'Boundary', pattern: /^## Boundary/im },
  { label: 'When to use', pattern: /^## When to use/im },
  { label: 'Workflow', pattern: /^## Workflow/im },
  { label: 'Operating principles', pattern: /^### Operating principles$/m },
  { label: 'Suggested response format', pattern: /^## Suggested response format/im },
  { label: 'Resources in this skill', pattern: /^## Resources in this skill/im },
  { label: 'Quick example', pattern: /^## Quick example/im },
  { label: 'Checklist before calling the skill done', pattern: /^## Checklist before calling the skill done/im },
];

export function cmdListSkills(args: ParsedArgs, repoRoot: string) { 
  const includeTemplate = Boolean(args['include-template']);
  const asJson = Boolean(args.json);
  const dirs = listSkillDirs(repoRoot, includeTemplate);
  const rows = dirs.map((dir) => readSkillInfo(dir));
  if (asJson) {
    console.log(JSON.stringify(rows.map((r) => ({ folder: r.folder, name: r.name || null, path: r.path, has_skill_md: r.hasSkillMd })), null, 2));
    return;
  }
  const maxLen = Math.max(...rows.map((r) => r.folder.length));
  for (const r of rows) {
    console.log(`  ${chalk.cyan(r.folder.padEnd(maxLen))}  ${chalk.dim(r.name || '-')}`);
  }
  console.log(chalk.dim(`\n  ${rows.length} skills`));
}

export function cmdValidateSkills(args: ParsedArgs, repoRoot: string) {
  const includeTemplate = Boolean(args['include-template']);
  const dirs = listSkillDirs(repoRoot, includeTemplate);
  const errs: { folder: string; reason: string }[] = [];
  for (const dir of dirs) {
    const info = readSkillInfo(dir);
    if (!info.name) {
      errs.push({ folder: info.folder, reason: 'missing frontmatter name' });
      continue;
    }
    if (info.name !== info.folder) {
      errs.push({ folder: info.folder, reason: `name "${info.name}" must match folder` });
    }
  }
  if (errs.length > 0) {
    console.error(chalk.red(`\nValidation failed — ${errs.length} error${errs.length > 1 ? 's' : ''}:\n`));
    const maxLen = Math.max(...errs.map((e) => e.folder.length));
    for (const { folder, reason } of errs) {
      console.error(`  ${chalk.red('✘')} ${chalk.yellow(folder.padEnd(maxLen))}  ${chalk.dim(reason)}`);
    }
    console.error();
    process.exit(2);
  }
  console.log(chalk.green(`Validated ${dirs.length} skills: OK`));
}

export function cmdAuditSkillStructure(args: ParsedArgs, repoRoot: string) {
  const includeTemplate = Boolean(args['include-template']);
  const asJson = Boolean(args.json);
  const asMarkdown = Boolean(args.markdown);
  const onlyActionable = Boolean(args['only-actionable']);
  const strict = Boolean(args.strict);
  const dirs = listSkillDirs(repoRoot, includeTemplate);

  const rows = dirs.map((dir) => {
    const info = readSkillInfo(dir);
    const content = info.content || '';
    const missing = STRUCTURAL_SECTION_CHECKS.filter((section) => !section.pattern.test(content)).map((section) => section.label);
    return {
      skill: info.folder,
      missing,
      missingCount: missing.length,
      isComplete: missing.length === 0,
    };
  });

  const outRows = onlyActionable ? rows.filter((row) => !row.isComplete) : rows;
  const missingBySection = STRUCTURAL_SECTION_CHECKS.map((section) => ({
    label: section.label,
    count: rows.filter((row) => row.missing.includes(section.label)).length,
  }));
  const incompleteCount = rows.filter((row) => !row.isComplete).length;

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          totalSkills: rows.length,
          incompleteSkills: incompleteCount,
          missingBySection,
          rows: outRows,
        },
        null,
        2,
      ),
    );
    if (strict && incompleteCount > 0) process.exit(2);
    return;
  }

  if (asMarkdown) {
    console.log('# Skill structure audit\n');
    console.log(`Total skills: **${rows.length}**`);
    console.log(`Incomplete skills: **${incompleteCount}**\n`);
    console.log('## Missing sections by type\n');
    console.log('| Section | Missing skills |');
    console.log('|---|---:|');
    missingBySection.forEach((section) => console.log(`| ${section.label} | ${section.count} |`));
    console.log('\n## Skill results\n');
    console.log('| Skill | Missing count | Missing sections |');
    console.log('|---|---:|---|');
    outRows.forEach((row) =>
      console.log(`| \`${row.skill}\` | ${row.missingCount} | ${row.missing.length ? row.missing.join(', ') : '—'} |`),
    );
    if (strict && incompleteCount > 0) process.exit(2);
    return;
  }

  const maxLen = Math.max(...outRows.map((row) => row.skill.length), 'Skill'.length);
  console.log(chalk.bold('Skill structure audit'));
  console.log(
    chalk.dim(
      `  total ${rows.length}  ·  incomplete ${incompleteCount}  ·  complete ${rows.length - incompleteCount}`,
    ),
  );
  console.log('');
  missingBySection.forEach((section) => {
    const color =
      section.count === 0 ? chalk.green :
      section.count <= 5 ? chalk.yellow :
      chalk.red;
    console.log(`  ${color(section.label.padEnd(36))} ${chalk.bold(String(section.count))}`);
  });

  if (outRows.length > 0) {
    console.log('');
    outRows
      .sort((a, b) => b.missingCount - a.missingCount || a.skill.localeCompare(b.skill))
      .forEach((row) => {
        const badge = row.isComplete ? chalk.green('OK ') : chalk.red('MISS');
        console.log(`  ${badge}  ${chalk.cyan(row.skill.padEnd(maxLen))}  ${chalk.dim(row.missing.join(', ') || '—')}`);
      });
  }

  if (strict && incompleteCount > 0) process.exit(2);
}

// ─── validate-skill-quality ───────────────────────────────────────────────

const KARPATHY_CHECKLIST_PATTERNS = [
  /Assumptions stated|Think Before Coding/i,
  /minimum solution|Simplicity First/i,
  /Only touched|Surgical Changes/i,
  /Success criteria|Goal-Driven/i,
];

function extractSection(content: string, heading: RegExp): string | null {
  const sections = content.split(/\n(?=## )/);
  const found = sections.find((s) => heading.test(s));
  return found ?? null;
}

export function cmdValidateSkillQuality(args: ParsedArgs, repoRoot: string) {
  const strict = Boolean(args.strict);
  const asMarkdown = Boolean(args.markdown);
  const dirs = listSkillDirs(repoRoot, false);

  type QualityRow = {
    skill: string;
    errors: string[];
    warnings: string[];
  };

  const rows: QualityRow[] = [];

  for (const dir of dirs) {
    const info = readSkillInfo(dir);
    const skillPath = join(dir, 'SKILL.md');
    const raw = readFileSync(skillPath, 'utf8');
    const parsed = matter(raw);
    const content = parsed.content;
    const data = parsed.data as Record<string, unknown>;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Strict gate: metadata.short-description must be present
    const meta = data?.metadata as Record<string, unknown> | undefined;
    const shortDesc = meta?.['short-description'];
    if (!shortDesc || typeof shortDesc !== 'string' || shortDesc.trim() === '') {
      errors.push('missing metadata.short-description in frontmatter');
    }

    // Warning: Resources table should have data rows
    const resourceSection = extractSection(content, /^## Resources in this skill/i);
    if (resourceSection) {
      const pipeLines = resourceSection.split('\n').filter((l) => l.trim().startsWith('|')).length;
      if (pipeLines < 3) {
        warnings.push('## Resources in this skill table is empty or has no data rows');
      }
    }

    // Warning: Checklist should include Karpathy verification items
    const checklistSection = extractSection(content, /^## Checklist/i);
    if (checklistSection) {
      const matched = KARPATHY_CHECKLIST_PATTERNS.filter((p) => p.test(checklistSection)).length;
      if (matched < 2) {
        warnings.push('checklist missing Karpathy verification items (Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution)');
      }
    }

    rows.push({ skill: info.folder, errors, warnings });
  }

  const errorSkills = rows.filter((r) => r.errors.length > 0);
  const warnSkills = rows.filter((r) => r.warnings.length > 0);
  const totalErrors = errorSkills.reduce((n, r) => n + r.errors.length, 0);
  const totalWarns = warnSkills.reduce((n, r) => n + r.warnings.length, 0);

  if (asMarkdown) {
    console.log('# Skill quality validation\n');
    console.log(`Total skills: **${rows.length}**  |  Errors: **${totalErrors}**  |  Warnings: **${totalWarns}**\n`);
    if (errorSkills.length > 0) {
      console.log('## Errors (strict)\n');
      console.log('| Skill | Issue |');
      console.log('|---|---|');
      errorSkills.forEach((r) => r.errors.forEach((e) => console.log(`| \`${r.skill}\` | ${e} |`)));
      console.log('');
    }
    if (warnSkills.length > 0) {
      console.log('## Warnings\n');
      console.log('| Skill | Warning |');
      console.log('|---|---|');
      warnSkills.forEach((r) => r.warnings.forEach((w) => console.log(`| \`${r.skill}\` | ${w} |`)));
    }
    if (strict && errorSkills.length > 0) process.exit(2);
    return;
  }

  const maxLen = Math.max(...rows.map((r) => r.skill.length), 5);
  console.log(chalk.bold('Skill quality validation'));
  console.log(chalk.dim(`  total ${rows.length}  ·  errors ${totalErrors}  ·  warnings ${totalWarns}`));

  if (errorSkills.length > 0) {
    console.log('');
    console.log(chalk.red('Errors:'));
    for (const row of errorSkills) {
      for (const e of row.errors) {
        console.log(`  ${chalk.red('✘')} ${chalk.cyan(row.skill.padEnd(maxLen))}  ${chalk.dim(e)}`);
      }
    }
  }
  if (warnSkills.length > 0) {
    console.log('');
    console.log(chalk.yellow('Warnings:'));
    for (const row of warnSkills) {
      for (const w of row.warnings) {
        console.log(`  ${chalk.yellow('!')} ${chalk.cyan(row.skill.padEnd(maxLen))}  ${chalk.dim(w)}`);
      }
    }
  }
  if (errorSkills.length === 0 && warnSkills.length === 0) {
    console.log(chalk.green(`\n  All ${rows.length} skills pass quality checks`));
  }

  if (strict && errorSkills.length > 0) process.exit(2);
}

// ─── validate-workflows ───────────────────────────────────────────────────

const WORKFLOW_EXECUTION_HEADINGS = [/^## Steps/im, /^## Decision paths/im, /^## Workflow/im];
const WORKFLOW_OUTPUT_HEADINGS = [/^## Output format/im, /^## Outputs/im, /^## Suggested review format/im];

function collectWorkflowFiles(workflowsRoot: string): string[] {
  const files: string[] = [];
  if (!existsSync(workflowsRoot)) return files;
  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith('.md') && entry.name !== 'README.md') files.push(fullPath);
    }
  }
  walk(workflowsRoot);
  return files.sort();
}

export function cmdValidateWorkflows(args: ParsedArgs, repoRoot: string) {
  const strict = Boolean(args.strict);
  const asMarkdown = Boolean(args.markdown);
  const workflowsRoot = resolve(repoRoot, 'workflows');
  const files = collectWorkflowFiles(workflowsRoot);

  if (files.length === 0) {
    console.log(chalk.yellow('No workflow files found under workflows/'));
    return;
  }

  type WorkflowRow = {
    file: string;
    missing: string[];
  };

  const rows: WorkflowRow[] = [];

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf8');
    const rel = filePath.replace(repoRoot + '/', '');
    const missing: string[] = [];

    const hasExecution = WORKFLOW_EXECUTION_HEADINGS.some((p) => p.test(content));
    if (!hasExecution) {
      missing.push('missing execution section (## Steps, ## Decision paths, or ## Workflow)');
    }

    const hasOutput = WORKFLOW_OUTPUT_HEADINGS.some((p) => p.test(content));
    if (!hasOutput) {
      missing.push('missing output section (## Output format, ## Outputs, or ## Suggested review format)');
    }

    rows.push({ file: rel, missing });
  }

  const failures = rows.filter((r) => r.missing.length > 0);
  const failCount = failures.length;

  if (asMarkdown) {
    console.log('# Workflow validation\n');
    console.log(`Total workflows: **${rows.length}**  |  Failures: **${failCount}**\n`);
    if (failures.length > 0) {
      console.log('| File | Missing |');
      console.log('|---|---|');
      failures.forEach((r) => r.missing.forEach((m) => console.log(`| \`${r.file}\` | ${m} |`)));
    }
    if (strict && failCount > 0) process.exit(2);
    return;
  }

  const maxLen = Math.max(...rows.map((r) => r.file.length), 4);
  console.log(chalk.bold('Workflow validation'));
  console.log(chalk.dim(`  total ${rows.length}  ·  failures ${failCount}  ·  ok ${rows.length - failCount}`));
  console.log('');

  for (const row of rows) {
    const badge = row.missing.length === 0 ? chalk.green('OK  ') : chalk.red('FAIL');
    console.log(`  ${badge}  ${chalk.cyan(row.file.padEnd(maxLen))}  ${chalk.dim(row.missing.join('; ') || '—')}`);
  }

  if (failCount > 0) {
    console.error(chalk.red(`\n  ${failCount} workflow(s) failed validation`));
  } else {
    console.log(chalk.green(`\n  All ${rows.length} workflows pass`));
  }

  if (strict && failCount > 0) process.exit(2);
}
