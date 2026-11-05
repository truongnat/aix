import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { SKILL_BODY_MAX_TOKENS, ValidationError, SKILL_CATEGORIES } from '@x/core';
import type { SkillKind, Role, AppError, SkillCategory } from '@x/core';
import { SkillFrontmatterSchema } from './schema.js';
import type { SkillFrontmatter } from './schema.js';
import type { LoadedSkill, SkillCatalogEntry } from './types.js';

function tokenEstimate(text: string): number {
  return Math.ceil(text.length / 4);
}

export class SkillRegistry {
  readonly #skills: Map<string, LoadedSkill>;
  readonly #loadErrors: readonly AppError[];

  constructor(skills: readonly LoadedSkill[], loadErrors: readonly AppError[] = []) {
    this.#skills = new Map();
    const errors = [...loadErrors];
    for (const skill of skills) {
      const existing = this.#skills.get(skill.id);
      if (existing) {
        errors.push(new ValidationError(
          `Duplicate skill name "${skill.id}" also declared in ${existing.dir}`,
          { path: join(skill.dir, 'SKILL.md') },
        ));
        continue;
      }
      this.#skills.set(skill.id, skill);
    }
    this.#loadErrors = errors;
  }

  static async load(contentRoot: string): Promise<SkillRegistry> {
    let skillsDir = join(contentRoot, 'skills');
    try {
      const s = await stat(skillsDir);
      if (!s.isDirectory()) skillsDir = contentRoot;
    } catch {
      skillsDir = contentRoot;
    }
    const skills: LoadedSkill[] = [];
    const errors: AppError[] = [];

    let topEntries: string[];
    try {
      topEntries = await readdir(skillsDir);
    } catch {
      return new SkillRegistry([]);
    }

    for (const topName of topEntries.sort()) {
      const topPath = join(skillsDir, topName);
      let topStat;
      try { topStat = await stat(topPath); } catch { continue; }
      if (!topStat.isDirectory()) continue;

      // Category container: has no SKILL.md directly but its name is a known category.
      // Scan one level deeper for skill subdirs.
      const isCategory = (SKILL_CATEGORIES as readonly string[]).includes(topName);
      const hasSKILL = await stat(join(topPath, 'SKILL.md')).then(s => s.isFile()).catch(() => false);

      if (isCategory && !hasSKILL) {
        // recurse into category dir
        let subEntries: string[];
        try { subEntries = await readdir(topPath); } catch { continue; }
        for (const subName of subEntries.sort()) {
          const subPath = join(topPath, subName);
          let subStat;
          try { subStat = await stat(subPath); } catch { continue; }
          if (!subStat.isDirectory()) continue;
          const loaded = await SkillRegistry.#loadSkillDir(subPath, subName, errors, topName as SkillCategory);
          if (loaded) skills.push(loaded);
        }
      } else {
        // flat skill at top level (backward-compat) or skill with x-category in frontmatter
        const loaded = await SkillRegistry.#loadSkillDir(topPath, topName, errors, undefined);
        if (loaded) skills.push(loaded);
      }
    }

    return new SkillRegistry(skills, errors);
  }

  static async #loadSkillDir(
    skillDir: string,
    dirName: string,
    errors: AppError[],
    categoryOverride: SkillCategory | undefined,
  ): Promise<LoadedSkill | null> {
    const skillMdPath = join(skillDir, 'SKILL.md');
    let mdStat;
    try { mdStat = await stat(skillMdPath); } catch { return null; }
    if (!mdStat.isFile()) return null;

    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(await readFile(skillMdPath, 'utf-8'));
    } catch (cause) {
      errors.push(new ValidationError(
        `Skill "${dirName}" frontmatter could not be read or parsed`,
        { path: skillMdPath, cause },
      ));
      return null;
    }

    const result = SkillFrontmatterSchema.safeParse(parsed.data);
    if (!result.success) {
      errors.push(new ValidationError(
        `Skill "${dirName}" frontmatter invalid — ${result.error.issues.map(i => i.message).join('; ')}`,
        { path: skillMdPath },
      ));
      return null;
    }

    const frontmatter: SkillFrontmatter = result.data;
    const body = parsed.content;
    const estimate = tokenEstimate(body);
    if (estimate > SKILL_BODY_MAX_TOKENS) {
      console.warn(`[registry] WARN ${dirName}: body ~${estimate} tokens (max ${SKILL_BODY_MAX_TOKENS})`);
    }

    const references: string[] = [];
    const scripts: string[] = [];
    const assets: string[] = [];

    const subDirs: string[] = [];
    try {
      for (const entry of await readdir(skillDir)) {
        const subPath = join(skillDir, entry);
        const subStat = await stat(subPath);
        if (subStat.isDirectory()) subDirs.push(entry);
      }
    } catch { /* no subdirectories */ }

    for (const subDir of subDirs) {
      const subPath = join(skillDir, subDir);
      const target = subDir === 'references' ? references
        : subDir === 'scripts' ? scripts
        : subDir === 'assets' ? assets
        : null;
      if (target) {
        try {
          for (const file of await readdir(subPath)) {
            target.push(join(subPath, file));
          }
        } catch { /* empty dir */ }
      }
    }

    const category: SkillCategory | undefined =
      categoryOverride ?? (frontmatter['x-category'] as SkillCategory | undefined);

    return {
      id: frontmatter.name,
      dir: skillDir,
      frontmatter,
      body,
      category,
      bodyTokenEstimate: estimate,
      references,
      scripts,
      assets,
    };
  }

  all(): readonly LoadedSkill[] {
    return [...this.#skills.values()];
  }

  get(name: string): LoadedSkill | undefined {
    return this.#skills.get(name);
  }

  byKind(kind: SkillKind): readonly LoadedSkill[] {
    return this.all().filter(s => s.frontmatter['x-kind'] === kind);
  }

  byRole(role: Role): readonly LoadedSkill[] {
    return this.all().filter(s => s.frontmatter['x-roles'].includes(role));
  }

  byCategory(category: SkillCategory): readonly LoadedSkill[] {
    return this.all().filter(s => s.category === category);
  }

  search(query: string): readonly SkillCatalogEntry[] {
    const q = query.toLowerCase();
    return this.all()
      .filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.frontmatter.description.toLowerCase().includes(q) ||
        s.frontmatter['x-tags'].some(t => t.toLowerCase().includes(q))
      )
      .map(s => this.#toEntry(s));
  }

  toCatalog(): readonly SkillCatalogEntry[] {
    return this.all().map(s => this.#toEntry(s));
  }

  validateAll(): readonly AppError[] {
    const errors: AppError[] = [...this.#loadErrors];
    for (const skill of this.#skills.values()) {
      if (skill.bodyTokenEstimate > SKILL_BODY_MAX_TOKENS) {
        errors.push({
          code: 'WARN',
          message: `Skill "${skill.id}" body quá dài: ~${skill.bodyTokenEstimate} tokens (max ${SKILL_BODY_MAX_TOKENS})`,
          path: skill.dir,
          cause: undefined,
        } as AppError);
      }
    }
    return errors;
  }

  #toEntry(skill: LoadedSkill): SkillCatalogEntry {
    return {
      name: skill.frontmatter.name,
      description: skill.frontmatter.description,
      kind: skill.frontmatter['x-kind'],
      tags: skill.frontmatter['x-tags'],
      version: skill.frontmatter['x-version'],
      roles: skill.frontmatter['x-roles'],
      compatible: skill.frontmatter['x-compatible'],
      category: skill.category,
      dir: skill.dir,
    };
  }
}
