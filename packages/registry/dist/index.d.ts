import { z } from 'zod';
import { AppError, SkillKind } from '@x/core';
import { PolicyEngine } from '@x/policy';

/**
 * Agent Skills spec frontmatter (agentskills.io) + aix `metadata:` map.
 * Custom fields live ONLY under `metadata:` — never `x-*` top-level keys.
 */
declare const SkillFrontmatterSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    license: z.ZodOptional<z.ZodString>;
    compatibility: z.ZodOptional<z.ZodString>;
    'disable-model-invocation': z.ZodOptional<z.ZodBoolean>;
    'user-invocable': z.ZodOptional<z.ZodBoolean>;
    'allowed-tools': z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    name: string;
    description: string;
    metadata: Record<string, string>;
    license?: string | undefined;
    compatibility?: string | undefined;
    'disable-model-invocation'?: boolean | undefined;
    'user-invocable'?: boolean | undefined;
    'allowed-tools'?: string | undefined;
}, {
    name: string;
    description: string;
    license?: string | undefined;
    compatibility?: string | undefined;
    'disable-model-invocation'?: boolean | undefined;
    'user-invocable'?: boolean | undefined;
    'allowed-tools'?: string | undefined;
    metadata?: Record<string, string> | undefined;
}>;
type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;
/** Typed view over the free-form metadata map. */
interface SkillMeta {
    readonly kind: string;
    readonly version: string;
    readonly tags: readonly string[];
    readonly roles: readonly string[];
    readonly compatible: readonly string[];
}

interface LoadedSkill {
    readonly id: string;
    readonly dir: string;
    readonly frontmatter: SkillFrontmatter;
    readonly meta: SkillMeta;
    readonly body: string;
    readonly bodyTokenEstimate: number;
    readonly references: readonly string[];
    readonly scripts: readonly string[];
    readonly assets: readonly string[];
}
interface SkillCatalogEntry {
    readonly name: string;
    readonly description: string;
    readonly kind: string;
    readonly tags: readonly string[];
    readonly version: string;
    readonly roles: readonly string[];
    readonly compatible: readonly string[];
    readonly dir: string;
}
interface MigrationReport {
    readonly converted: readonly {
        from: string;
        to: string;
    }[];
    readonly duplicates: readonly {
        name: string;
        sources: string[];
    }[];
    readonly dropped: readonly {
        name: string;
        reason: string;
    }[];
    readonly errors: readonly AppError[];
}

declare class SkillRegistry {
    #private;
    constructor(skills: readonly LoadedSkill[]);
    static load(contentRoot: string): Promise<SkillRegistry>;
    all(): readonly LoadedSkill[];
    get(name: string): LoadedSkill | undefined;
    byKind(kind: string): readonly LoadedSkill[];
    byRole(role: string): readonly LoadedSkill[];
    search(query: string): readonly SkillCatalogEntry[];
    toCatalog(): readonly SkillCatalogEntry[];
    validateAll(): readonly AppError[];
}

declare function migrateSkills(opts: {
    sources: readonly string[];
    outDir: string;
    write?: boolean;
    kindMap?: Record<string, SkillKind>;
    policyEngine?: PolicyEngine;
}): Promise<MigrationReport>;

export { type LoadedSkill, type MigrationReport, type SkillCatalogEntry, type SkillFrontmatter, SkillFrontmatterSchema, SkillRegistry, migrateSkills };
