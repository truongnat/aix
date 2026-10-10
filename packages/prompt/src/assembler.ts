import type { Role, Phase, SystemPromptParts } from '@x/core';
import type { SkillRegistry, SkillCatalogEntry } from '@x/registry';
import type { MemoryStore, MemoryRecord } from '@x/memory';

export interface AssembleContext {
  readonly role: Role;
  readonly phase: Phase;
  readonly task: string;
  readonly tags: readonly string[];
}

export interface AssembledPrompt {
  readonly system: string;
  readonly skillMetadata: readonly SkillCatalogEntry[];
  readonly fewShot: readonly MemoryRecord[];
  readonly user: string;
  readonly tokenEstimate: number;
}

export class PromptAssembler {
  constructor(
    private readonly registry: SkillRegistry,
    private readonly memory: MemoryStore,
    private readonly parts: SystemPromptParts,
  ) {}

  async assemble(ctx: AssembleContext): Promise<AssembledPrompt> {
    const system = [
      this.parts.base.trim(),
      this.parts.responseContract.trim(),
      this.parts.toneFormat.trim(),
    ].filter(Boolean).join('\n\n');

    const relevantSkills = this.registry.byRole(ctx.role);
    const skillLines = relevantSkills.map(s =>
      `- ${s.id}: ${s.frontmatter.description}`
    );
    const skillBlock = skillLines.length > 0
      ? `\n\nAvailable skills:\n${skillLines.join('\n')}`
      : '';

    const systemWithSkills = system + skillBlock;

    const skillMetadata: SkillCatalogEntry[] = relevantSkills.map(s => ({
      name: s.frontmatter.name,
      description: s.frontmatter.description,
      kind: s.meta.kind,
      tags: s.meta.tags,
      version: s.meta.version,
      roles: s.meta.roles,
      compatible: s.meta.compatible,
      dir: s.dir,
    }));

    const fewShot = ctx.tags.length > 0
      ? await this.memory.search(ctx.task, { tags: ctx.tags, k: 3 })
      : [];

    const totalChars = systemWithSkills.length
      + fewShot.reduce((s, r) => s + r.body.length, 0)
      + ctx.task.length;
    const tokenEstimate = Math.ceil(totalChars / 4);

    return {
      system: systemWithSkills,
      skillMetadata,
      fewShot,
      user: ctx.task,
      tokenEstimate,
    };
  }
}
