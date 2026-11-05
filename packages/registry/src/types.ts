import type { SkillFrontmatter } from './schema.js';
import type { SkillKind, Role, Provider, AppError, SkillCategory } from '@x/core';

export interface LoadedSkill {
  readonly id: string;
  readonly dir: string;
  readonly frontmatter: SkillFrontmatter;
  readonly body: string;
  readonly category?: SkillCategory | undefined;
  readonly bodyTokenEstimate: number;
  readonly references: readonly string[];
  readonly scripts: readonly string[];
  readonly assets: readonly string[];
}

export interface SkillCatalogEntry {
  readonly name: string;
  readonly description: string;
  readonly kind: SkillKind;
  readonly tags: readonly string[];
  readonly version: string;
  readonly roles: readonly Role[];
  readonly compatible: readonly Provider[];
  readonly category?: SkillCategory | undefined;
  readonly dir: string;
}

export interface MigrationReport {
  readonly converted: readonly { from: string; to: string }[];
  readonly duplicates: readonly { name: string; sources: string[] }[];
  readonly dropped: readonly { name: string; reason: string }[];
  readonly errors: readonly AppError[];
}
