# Skill: database-design
Schema: antigrav.skill@v1

```json
{
  "description": "Database design principles and decision-making. Schema design, indexing strategy, ORM selection, serverless databases.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154368,
  "model": "qwen3:8b",
  "name": "database-design",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "database-design/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Database design principles and decision-making. Schema design, indexing strategy, ORM selection, serverless databases.

## When to Use
- Use when the task matches this skill domain.

## Examples
- > **Learn to THINK, not copy SQL patterns.**

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `database-design/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Database Design > **Learn to THINK, not copy SQL patterns.** ## 🎯 Selective Reading Rule **Read ONLY files relevant to the request!** Check the content map, find what you need. | File | Description | When to Read | |------|-------------|--------------| | `database-selection.md` | PostgreSQL vs Neon vs Turso vs SQLite | Choosing database | | `orm-selection.md` | Drizzle vs Prisma vs Kysely | Choosing ORM | | `schema-design.md` | Normalization, PKs, relationships | Designing schema | | `indexing.md` | Index types, composite indexes | Performance tuning | | `optimization.md` | N+1, EXPLAIN ANALYZE | Query optimization | | `migrations.md` | Safe migrations, serverless DBs | Schema changes | --- ## ⚠️ Core Principle - ASK user for database preferences when unclear - Choose database/ORM based

{{input}}
