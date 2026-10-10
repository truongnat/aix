import { z } from 'zod';
import { SKILL_NAME_MAX, SKILL_DESC_MAX } from '@x/core';

/**
 * Agent Skills spec frontmatter (agentskills.io) + aix `metadata:` map.
 * Custom fields live ONLY under `metadata:` — never `x-*` top-level keys.
 */
export const SkillFrontmatterSchema = z.object({
  name: z.string()
    .min(1)
    .max(SKILL_NAME_MAX, `name tối đa ${SKILL_NAME_MAX} ký tự`)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kebab-case: chữ-thường/số/gạch-nối, không đầu/cuối/lặp dấu -'),

  description: z.string()
    .min(1, 'description bắt buộc')
    .max(SKILL_DESC_MAX, `description tối đa ${SKILL_DESC_MAX} ký tự`),

  license: z.string().optional(),
  compatibility: z.string().max(500).optional(),

  'disable-model-invocation': z.boolean().optional(),
  'user-invocable': z.boolean().optional(),
  'allowed-tools': z.string().optional(),

  metadata: z.record(z.string(), z.string()).default({}),
}).strict();

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;

/** Typed view over the free-form metadata map. */
export interface SkillMeta {
  readonly kind: string;
  readonly version: string;
  readonly tags: readonly string[];
  readonly roles: readonly string[];
  readonly compatible: readonly string[];
}

const splitCsv = (v: string | undefined): readonly string[] =>
  v ? v.split(',').map(s => s.trim()).filter(Boolean) : [];

export function parseMeta(metadata: Readonly<Record<string, string>>): SkillMeta {
  return {
    kind: metadata['kind'] ?? 'domain',
    version: metadata['version'] ?? '0.1.0',
    tags: splitCsv(metadata['tags']),
    roles: splitCsv(metadata['roles']),
    compatible: splitCsv(metadata['compatible']),
  };
}
