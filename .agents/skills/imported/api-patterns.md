# Skill: api-patterns
Schema: antigrav.skill@v1

```json
{
  "description": "API design principles and decision-making. REST vs GraphQL vs tRPC selection, response formats, versioning, pagination.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154356,
  "model": "qwen3:8b",
  "name": "api-patterns",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "api-patterns/SKILL.md",
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
API design principles and decision-making. REST vs GraphQL vs tRPC selection, response formats, versioning, pagination.

## When to Use
- Use when the task matches this skill domain.

## Examples
- > API design principles and decision-making for 2025. > **Learn to THINK, not copy fixed patterns.**

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `api-patterns/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# API Patterns > API design principles and decision-making for 2025. > **Learn to THINK, not copy fixed patterns.** ## 🎯 Selective Reading Rule **Read ONLY files relevant to the request!** Check the content map, find what you need. --- ## 📑 Content Map | File | Description | When to Read | |------|-------------|--------------| | `api-style.md` | REST vs GraphQL vs tRPC decision tree | Choosing API type | | `rest.md` | Resource naming, HTTP methods, status codes | Designing REST API | | `response.md` | Envelope pattern, error format, pagination | Response structure | | `graphql.md` | Schema design, when to use, security | Considering GraphQL | | `trpc.md` | TypeScript monorepo, type safety | TS fullstack projects | | `versioning.md` | URI/Header/Query versioning | API evolution planning | |

{{input}}
