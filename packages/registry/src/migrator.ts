import { readdir, mkdir, copyFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { statSync } from 'node:fs';
import matter from 'gray-matter';
import type { AppError, SkillKind } from '@x/core';
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

      for (const file of skill.files) {
        const src = join(skill.sourceDir, file);
        const dest = join(targetDir, file);
        try {
          await mkdir(targetDir, { recursive: true });
          await copyFile(src, dest);
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
