# Contributing skills to aix

`content/skills/` is the **community-editable layer** of aix. Everything here is the canonical
source — the plugin loads these directly (`"skills": ["./content/skills/"]` in
[`.claude-plugin/plugin.json`](../../.claude-plugin/plugin.json)) and the CLI compiles them to other
providers. You don't need to touch the TypeScript packages to add or improve a skill.

For the deeper *how to design a good skill* guidance, invoke the **`writing-skills`** skill. This file
is the contribution contract: layout, schema, and the checks your PR must pass.

## Layout

One skill = one directory under `content/skills/`, containing a `SKILL.md`:

```
content/skills/<skill-name>/
├── SKILL.md            # required — frontmatter + body
├── references/         # optional — L3 deep-dive docs, loaded on demand
└── examples/           # optional — sample inputs/outputs
```

- The directory name should match the skill's `name` (recommended, not enforced — the host keys
  skills by the frontmatter `name`).
- Keep `SKILL.md` focused; push long reference material into `references/` (progressive disclosure:
  L1 = description, L2 = SKILL.md body, L3 = references).

## SKILL.md frontmatter schema

Validated by Zod in [`packages/registry/src/schema.ts`](../../packages/registry/src/schema.ts). Source
of truth — if this table and the code disagree, the code wins.

| Field | Required | Type / rule | Default |
|-------|----------|-------------|---------|
| `name` | ✅ | `^[a-z0-9-]+$`, ≤ 64 chars, must **not** contain `claude`/`anthropic` | — |
| `description` | ✅ | 1–1024 chars; this is what the host uses to decide relevance | — |
| `x-kind` | ✅ | one of `domain` \| `process` \| `reference` | — |
| `x-version` | — | semver `\d+\.\d+\.\d+` | `0.1.0` |
| `x-tags` | — | `string[]` | `[]` |
| `x-roles` | — | subset of `planner` \| `coder` \| `reviewer` \| `architect` | `[]` |
| `x-compatible` | — | subset of `claude` \| `cursor` \| `codex` \| `gemini` | all four |
| `disable-model-invocation` | — | boolean | — |
| `user-invocable` | — | boolean | — |

**Custom keys must start with `x-`.** Any unknown key without the `x-` prefix fails validation.

### `x-kind` — pick the right one

- **`domain`** — a deep reference for a technology/area (`react-pro`, `aws-pro`). Most skills.
- **`process`** — *how to work*: a methodology step (`planning-pro`, `test-driven-development`).
  These form the [engineering spine](../workflows/engineering-spine.md).
- **`reference`** — a lookup/cheatsheet with little prescriptive process.

### Example

```markdown
---
name: my-new-skill
description: >-
  One or two sentences the host reads to decide when to pull this skill in.
  Be specific about the trigger ("use when …"), not just the topic.
x-kind: domain
x-version: 0.1.0
x-tags: [example, getting-started]
x-roles: [coder, reviewer]
x-compatible: [claude, cursor, codex, gemini]
---

# My New Skill

Body in Markdown. Lead with the most useful thing. Link L3 detail from `references/`.
```

## Before you open a PR

```bash
pnpm build                 # registry/compiler must compile
aix skills validate        # all skills must validate (your new one included)
aix skills show my-new-skill   # eyeball the parsed result
```

Checklist:

- [ ] `aix skills validate` passes with **0 new SKIP**.
- [ ] `name` is unique across `content/skills/` (no duplicate skill names).
- [ ] `description` actually describes *when to use* the skill, within 1024 chars.
- [ ] Correct `x-kind`; add `x-roles`/`x-tags` if they help discovery.
- [ ] No secrets, no PII, no machine-absolute paths in the skill body.
- [ ] Long material lives in `references/`, not inline.

A maintainer (see [`.github/CODEOWNERS`](../../.github/CODEOWNERS)) reviews changes under
`content/`. Process skills (`x-kind: process`) get extra scrutiny — they change how every agent works.
