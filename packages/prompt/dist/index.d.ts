import { Role, Phase, SystemPromptParts } from '@x/core';
import { SkillCatalogEntry, SkillRegistry } from '@x/registry';
import { MemoryRecord, MemoryStore } from '@x/memory';

interface AssembleContext {
    readonly role: Role;
    readonly phase: Phase;
    readonly task: string;
    readonly tags: readonly string[];
}
interface AssembledPrompt {
    readonly system: string;
    readonly skillMetadata: readonly SkillCatalogEntry[];
    readonly fewShot: readonly MemoryRecord[];
    readonly user: string;
    readonly tokenEstimate: number;
}
declare class PromptAssembler {
    private readonly registry;
    private readonly memory;
    private readonly parts;
    constructor(registry: SkillRegistry, memory: MemoryStore, parts: SystemPromptParts);
    assemble(ctx: AssembleContext): Promise<AssembledPrompt>;
}

interface LintIssue {
    readonly level: 'error' | 'warn';
    readonly message: string;
}
declare function lintPrompt(p: AssembledPrompt): readonly LintIssue[];

declare const DEFAULT_SYSTEM_PARTS: SystemPromptParts;

export { type AssembleContext, type AssembledPrompt, DEFAULT_SYSTEM_PARTS, type LintIssue, PromptAssembler, lintPrompt };
