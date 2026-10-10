# Frontmatter Guide

## Required Structure

```yaml
---
name: skill-name
description: |
  One-line scope statement.

  Use this skill when [concrete situations]. Also use for [secondary scenarios].

  Combine with **`related-skill-1`**, **`related-skill-2`** per integration map.

  Triggers: "keyword1", "keyword2", "keyword3", "phrase one", "phrase two"

metadata:
  short-description: Domain — key areas, comma-separated
  content-language: en
  domain: category-name
  level: professional
---
```

## Field Reference

### `name` (required)
- Kebab-case: `nestjs-neo4j-pro`, `kb-workflow`, `deploy-workflow`
- MUST match the folder name exactly
- Convention: `{topic}-pro` for general skills, `{topic}-workflow` for process skills

### `description` (required)
The most important field for skill discovery. The AI tool uses this to decide whether to activate the skill.

**Structure (4 parts):**
1. **Scope line**: What the skill does (one sentence)
2. **Use-cases**: "Use this skill when..." with concrete scenarios
3. **Combine-with**: References to related skills
4. **Triggers**: Explicit keywords/phrases in quotes

**Trigger guidelines:**
- Include the obvious: technology names, tool names
- Include the non-obvious: error messages, symptoms, question patterns
- Include abbreviations and aliases people actually type
- Be generous — false positives are better than missed activations

### `metadata.short-description` (required)
- Pattern: `Domain — areas`
- Example: `NestJS — pipeline/DI model, API/DX, RLS integration`
- Shown in skill listings

### `metadata.content-language` (optional)
- Default: `en`
- Refers to SKILL.md authoring language, NOT the user's chat language
- Skills always respond in the user's language regardless of this field

### `metadata.domain` (optional)
- Category: `backend`, `frontend`, `devops`, `data`, `security`, `identity`, etc.
- Used for filtering/grouping

### `metadata.level` (optional)
- `foundation` — basics, getting started
- `professional` — production patterns (most skills)
- `advanced` — edge cases, optimization, deep internals

## Trigger Writing Examples

### Good Triggers (specific, diverse)
```yaml
Triggers: "neo4j", "graph", "cypher", "MERGE", "MATCH", "relationship",
  "constraint", "neo4j-driver", "graph database", "node relationship",
  "CREATE CONSTRAINT", "bolt://", "Cannot resolve dependencies"
```

### Bad Triggers (too generic)
```yaml
Triggers: "database", "query", "data"
```
These would match every database question, not just Neo4j ones.

### Pattern: Include Error Messages
```yaml
Triggers: "neo4j", "Cannot resolve dependencies of Neo4jService",
  "ServiceUnavailable", "bolt connection refused"
```
Users often paste errors — triggering on error text is powerful.

## Common Mistakes

1. **Single-line description** — not enough context for routing
2. **No triggers line** — AI has to guess from prose
3. **Name doesn't match folder** — breaks install/publish pipeline
4. **Missing combine-with** — no cross-referencing between skills
5. **Level field misused** — "advanced" doesn't mean "good"; it means "for edge cases"
