import { z } from 'zod';
import { SKILL_KINDS, PROVIDERS, ROLES, SKILL_NAME_MAX, SKILL_DESC_MAX } from '@x/core';

const skillFrontmatterBase = z.object({
  name: z.string()
    .max(SKILL_NAME_MAX, `name tối đa ${SKILL_NAME_MAX} ký tự`)
    .regex(/^[a-z0-9-]+$/, 'chỉ chữ-thường/số/gạch-nối')
    .refine(s => !/claude|anthropic/i.test(s), 'không được chứa "claude"/"anthropic"'),

  description: z.string()
    .min(1, 'description bắt buộc')
    .max(SKILL_DESC_MAX, `description tối đa ${SKILL_DESC_MAX} ký tự`),

  'disable-model-invocation': z.boolean().optional(),
  'user-invocable': z.boolean().optional(),

  'x-kind': z.enum(SKILL_KINDS),

  'x-tags': z.array(z.string()).default([]),

  'x-version': z.string()
    .regex(/^\d+\.\d+\.\d+$/, 'x-version phải là semver (vd 1.2.3)')
    .default('0.1.0'),

  'x-roles': z.array(z.enum(ROLES)).default([]),

  'x-compatible': z.array(z.enum(PROVIDERS)).default([...PROVIDERS]),
});

const knownKeys = new Set(Object.keys(skillFrontmatterBase.shape));

export const SkillFrontmatterSchema = skillFrontmatterBase
  .passthrough()
  .superRefine((data, ctx) => {
    for (const key of Object.keys(data)) {
      if (!key.startsWith('x-') && !knownKeys.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Key lạ không bắt đầu bằng "x-": "${key}"`,
          path: [key],
        });
      }
    }
  });

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;
