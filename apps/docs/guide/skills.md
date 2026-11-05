# Skills & Progressive Disclosure

## Canonical source

Author skills in `skills/<category>/<directory>/SKILL.md`. The current library contains 160
canonical skill files organized into 9 categories.
The host resolves the frontmatter `name`, which matches the directory name.

| Layer | Content | Loading |
|---|---|---|
| Metadata | Name, description, kind and tags | Host discovery/catalog |
| Instructions | Skill body | When selected |
| Resources | References, scripts and assets | On demand |

The registry warns when the estimated body exceeds 5000 tokens. This is an estimate, not
a guarantee of host context cost.

## Metadata example

```yaml
---
name: example-domain-skill
description: Domain guidance and the situations in which it applies.
x-kind: domain
x-version: 0.1.0
x-tags: [example]
x-roles: [coder, reviewer]
x-compatible: [claude, cursor, codex, gemini]
---
```

Kinds are `domain`, `process`, and `reference`. Names are lowercase kebab-case, at most 64
characters, and cannot contain `claude` or `anthropic`. Description is required and limited
to 2048 characters. See the registry schema and canonical contribution guide for full rules.

## Inspect and validate

```bash
node packages/cli/dist/index.js skills list
node packages/cli/dist/index.js skills show api-design-pro
node packages/cli/dist/index.js skills validate
node packages/cli/dist/index.js skills validate --content-root /path/to/content
```

`list` writes the machine-local generated `catalog.json`. Validation reports malformed YAML,
invalid frontmatter and duplicate identifiers with file paths, retaining the first valid
entry instead of silently overwriting it. Fatal diagnostics exit nonzero; body-size warnings
remain nonfatal. A successful validation does not execute any skill's instructions.
