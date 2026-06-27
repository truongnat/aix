import { readdir, mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { statSync } from 'node:fs';
import matter from 'gray-matter';
import { SKILL_DESC_MAX } from '@x/core';
import type { AppError, SkillKind } from '@x/core';
import type { PolicyEngine } from '@x/policy';
import type { MigrationReport } from './types.js';

const DEFAULT_SOURCE_KINDS: Record<string, SkillKind> = {
  'skills/skills': 'domain',
  'system-design-skills': 'reference',
  'ai-engineering-harness/skills': 'process',
  'dev-memory/skills': 'domain',
};

function resolveKind(sourcePath: string, kindMap?: Record<string, SkillKind>): SkillKind | undefined {
  const map = kindMap ?? DEFAULT_SOURCE_KINDS;
  for (const [key, kind] of Object.entries(map)) {
    if (sourcePath.endsWith(key) || sourcePath.endsWith('/' + key)) return kind;
  }
  return undefined;
}

interface SkillEntry {
  name: string;
  sourceDir: string;
  files: string[];
  subdirs: Map<string, string[]>;
  kind: SkillKind;
}

async function detectKindFromFrontmatter(skillDir: string): Promise<SkillKind | undefined> {
  try {
    const raw = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
    const parsed = matter(raw);
    const k = parsed.data?.['x-kind'];
    if (typeof k === 'string' && ['domain', 'process', 'reference'].includes(k)) {
      return k as SkillKind;
    }
  } catch {
    // frontmatter unreadable or missing
  }
  return undefined;
}

async function scanSkillDir(dirPath: string, name: string): Promise<SkillEntry | null> {
  try {
    const entries = await readdir(dirPath);
    if (!entries.includes('SKILL.md')) return null;

    const files: string[] = [];
    const subdirs = new Map<string, string[]>();

    for (const entry of entries) {
      if (entry.startsWith('.')) continue;
      const fullPath = join(dirPath, entry);
      let isDir = false;
      try {
        isDir = statSync(fullPath).isDirectory();
      } catch {
        continue;
      }
      if (isDir) {
        const subFiles = (await readdir(fullPath)).map(f => join(entry, f));
        subdirs.set(entry, subFiles);
      } else {
        files.push(entry);
      }
    }

    return { name, sourceDir: dirPath, files, subdirs, kind: 'domain' };
  } catch {
    return null;
  }
}

export async function migrateSkills(opts: {
  sources: readonly string[];
  outDir: string;
  write?: boolean;
  kindMap?: Record<string, SkillKind>;
  policyEngine?: PolicyEngine;
}): Promise<MigrationReport> {
  const dryRun = opts.write !== true;
  const errors: AppError[] = [];
  const allSkills: SkillEntry[] = [];

  // Phase 1 — Scan all sources
  for (const source of opts.sources) {
    let sourceEntries: string[];
    try {
      sourceEntries = await readdir(source);
    } catch (e) {
      errors.push({ code: 'IO', message: `Cannot read source: ${source}`, cause: e, path: source } as AppError);
      continue;
    }

    const sourceKind = resolveKind(source, opts.kindMap);
    const isMerge = sourceEntries.includes('SKILL.md');

    if (isMerge) {
      // Merge-source (e.g., system-design-skills):
      // all content folds into one skill with references/
      const name = 'system-design-pro';
      const files: string[] = [];
      const subdirs = new Map<string, string[]>();

      for (const entry of sourceEntries) {
        if (entry.startsWith('.')) continue;
        const fullPath = join(source, entry);
        let isDir = false;
        try {
          isDir = statSync(fullPath).isDirectory();
        } catch {
          continue;
        }
        if (isDir) {
          if (entry === 'references') {
            const refs = (await readdir(fullPath))
              .filter(f => f.endsWith('.md'))
              .map(f => join('references', f));
            subdirs.set('references', refs);
          }
        } else {
          files.push(entry);
        }
      }

      allSkills.push({
        name,
        sourceDir: source,
        files,
        subdirs,
        kind: sourceKind ?? 'reference',
      });
    } else {
      // Normal source — scan subdirectories for skill folders
      for (const entry of sourceEntries) {
        if (entry.startsWith('.')) continue;
        const skillDir = join(source, entry);
        const skill = await scanSkillDir(skillDir, entry);
        if (!skill) continue;

        if (sourceKind) {
          skill.kind = sourceKind;
        } else {
          const detected = await detectKindFromFrontmatter(skill.sourceDir);
          if (detected) skill.kind = detected;
        }

        allSkills.push(skill);
      }
    }
  }

  // Phase 2 — Deduplicate by name
  const byName = new Map<string, SkillEntry[]>();
  for (const skill of allSkills) {
    const existing = byName.get(skill.name) ?? [];
    existing.push(skill);
    byName.set(skill.name, existing);
  }

  const duplicates: { name: string; sources: string[] }[] = [];
  const dropped: { name: string; reason: string }[] = [];
  const keepSet = new Set<SkillEntry>();

  for (const [name, entries] of byName) {
    if (entries.length === 1) {
      keepSet.add(entries[0]!);
    } else {
      duplicates.push({ name, sources: entries.map(e => e.sourceDir) });
      // Keep the richer version: prefer devkit (skills/skills) over dev-memory
      const preferred = entries.find(e => e.sourceDir.includes('skills/skills')) ?? entries[0]!;
      keepSet.add(preferred);
      for (const e of entries) {
        if (e !== preferred) {
          dropped.push({
            name: e.name,
            reason: `Duplicate: keeping "${preferred.sourceDir}", dropping "${e.sourceDir}"`,
          });
        }
      }
    }
  }

  const converted = [...keepSet].map(s => ({ from: s.sourceDir, to: join(opts.outDir, s.name) }));

  // Phase 3 — Write (only if not dry-run)
  if (!dryRun) {
    for (const skill of keepSet) {
      const targetDir = join(opts.outDir, skill.name);
      await mkdir(targetDir, { recursive: true });

      for (const file of skill.files) {
        const src = join(skill.sourceDir, file);
        const dest = join(targetDir, file);
        try {
          if (file === 'SKILL.md') {
            const raw = await readFile(src, 'utf-8');
            const parsed = matter(raw);

            // Normalize frontmatter to match registry schema
            const knownKeys = new Set(['name', 'description', 'disable-model-invocation', 'user-invocable']);
            const cleaned: Record<string, unknown> = {};
            for (const [key, val] of Object.entries(parsed.data)) {
              if (knownKeys.has(key) || key.startsWith('x-')) {
                cleaned[key] = val;
              }
            }
            // Ensure required fields
            if (!cleaned['name'] || String(cleaned['name']).trim() === '') {
              cleaned['name'] = skill.name;
            }
            // Sanitize name: lowercase, replace spaces/special chars with hyphens
            let skillName = String(cleaned['name']).toLowerCase().trim();
            skillName = skillName.replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
            if (!skillName) skillName = skill.name;
            // Reject names containing claude/anthropic
            if (/claude|anthropic/.test(skillName)) {
              skillName = skillName.replace(/claude|anthropic/g, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
              if (!skillName || skillName.length < 2) skillName = 'specialized-pro';
            }
            cleaned['name'] = skillName;
            if (!cleaned['description'] || String(cleaned['description']).trim() === '') {
              cleaned['description'] = `Skill: ${skillName}`;
            }
            if (typeof cleaned['description'] === 'string' && cleaned['description'].length > SKILL_DESC_MAX) {
              cleaned['description'] = (cleaned['description'] as string).slice(0, SKILL_DESC_MAX);
            }
            cleaned['x-kind'] ??= skill.kind;
            cleaned['x-version'] ??= '0.1.0';
            cleaned['x-roles'] ??= [];
            cleaned['x-tags'] ??= [];
            cleaned['x-compatible'] ??= ['claude', 'cursor', 'codex', 'gemini'];

            const engine = opts.policyEngine;
            if (engine) {
              for (const key of Object.keys(cleaned)) {
                const val = cleaned[key];
                if (typeof val === 'string') {
                  cleaned[key] = engine.redact(val).clean;
                } else if (Array.isArray(val)) {
                  cleaned[key] = val.map(v => typeof v === 'string' ? engine.redact(v).clean : v);
                }
              }
              const cleanBody = engine.redact(parsed.content).clean;
              const output = matter.stringify(cleanBody, cleaned);
              await writeFile(dest, output, 'utf-8');
            } else {
              const output = matter.stringify(parsed.content, cleaned);
              await writeFile(dest, output, 'utf-8');
            }
          } else {
            await copyFile(src, dest);
          }
        } catch (e) {
          errors.push({ code: 'IO', message: `Failed to copy ${src}`, cause: e, path: src } as AppError);
        }
      }

      for (const [subdir, files] of skill.subdirs) {
        for (const file of files) {
          const src = join(skill.sourceDir, file);
          const dest = join(targetDir, file);
          try {
            await mkdir(join(targetDir, subdir), { recursive: true });
            await copyFile(src, dest);
          } catch (e) {
            errors.push({ code: 'IO', message: `Failed to copy ${src}`, cause: e, path: src } as AppError);
          }
        }
      }
    }
  }

  return { converted, duplicates, dropped, errors };
}
