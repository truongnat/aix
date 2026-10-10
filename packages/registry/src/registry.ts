import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { SKILL_BODY_MAX_TOKENS } from '@x/core';
import type { AppError } from '@x/core';
import { parseMeta } from './schema.js';
import { SkillFrontmatterSchema } from './schema.js';
import type { SkillFrontmatter } from './schema.js';
import type { LoadedSkill, SkillCatalogEntry } from './types.js';

function tokenEstimate(text: string): number {
  return Math.ceil(text.length / 4);
}

export class SkillRegistry {
  readonly #skills: Map<string, LoadedSkill>;

  constructor(skills: readonly LoadedSkill[]) {
    this.#skills = new Map(skills.map(s => [s.id, s]));
  }

  static async load(contentRoot: string): Promise<SkillRegistry> {
    const skillsDir = join(contentRoot, 'skills');
    const skills: LoadedSkill[] = [];

    let skillDirs: string[];
    try {
      skillDirs = await readdir(skillsDir);
    } catch {
      return new SkillRegistry([]);
    }

    for (const dirName of skillDirs) {
      const skillDir = join(skillsDir, dirName);
      let dirStat;
      try {
        dirStat = await stat(skillDir);
      } catch {
        continue;
      }
      if (!dirStat.isDirectory()) continue;

      const skillMdPath = join(skillDir, 'SKILL.md');
      let mdStat;
      try {
        mdStat = await stat(skillMdPath);
      } catch {
        continue;
      }
      if (!mdStat.isFile()) continue;

      const raw = await readFile(skillMdPath, 'utf-8');
      const parsed = matter(raw);
      const result = SkillFrontmatterSchema.safeParse(parsed.data);

      if (!result.success) {
        console.warn(`[registry] SKIP ${dirName}: frontmatter invalid — ${result.error.issues.map(i => i.message).join('; ')}`);
        continue;
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
          if (subStat.isDirectory()) {
            subDirs.push(entry);
          }
        }
      } catch {
        // no subdirectories
      }

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
          } catch {
            // empty dir
          }
        }
      }
      // spec: frontmatter name MUST equal directory name
      if (frontmatter.name !== dirName) {
        console.warn(`[registry] SKIP ${dirName}: frontmatter name "${frontmatter.name}" ≠ dir name`);
        continue;
      }

      skills.push({
        id: frontmatter.name,
        dir: skillDir,
        frontmatter,
        meta: parseMeta(frontmatter.metadata),
        body,
        bodyTokenEstimate: estimate,
        references,
        scripts,
        assets,
      });
    }

    return new SkillRegistry(skills);
  }

  all(): readonly LoadedSkill[] {
    return [...this.#skills.values()];
  }

  get(name: string): LoadedSkill | undefined {
    return this.#skills.get(name);
  }

  byKind(kind: string): readonly LoadedSkill[] {
    return this.all().filter(s => s.meta.kind === kind);
  }

  byRole(role: string): readonly LoadedSkill[] {
    return this.all().filter(s => s.meta.roles.includes(role));
  }

  search(query: string): readonly SkillCatalogEntry[] {
    const q = query.toLowerCase();
    return this.all()
      .filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.frontmatter.description.toLowerCase().includes(q) ||
        s.meta.tags.some(t => t.toLowerCase().includes(q))
      )
      .map(s => this.#toEntry(s));
  }

  toCatalog(): readonly SkillCatalogEntry[] {
    return this.all().map(s => this.#toEntry(s));
  }

  validateAll(): readonly AppError[] {
    const errors: AppError[] = [];
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
      kind: skill.meta.kind,
      tags: skill.meta.tags,
      version: skill.meta.version,
      roles: skill.meta.roles,
      compatible: skill.meta.compatible,
      dir: skill.dir,
    };
  }
}
