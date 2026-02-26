# Skill: backend-dev-guidelines
Schema: antigrav.skill@v1

```json
{
  "description": "Opinionated backend development standards for Node.js + Express + TypeScript microservices. Covers layered architecture, BaseController pattern, dependency injection, Prisma repositories, Zod valid...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154362,
  "model": "qwen3:8b",
  "name": "backend-dev-guidelines",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "backend-dev-guidelines/SKILL.md",
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
Opinionated backend development standards for Node.js + Express + TypeScript microservices. Covers layered architecture, BaseController pattern, dependency injection, Prisma repositories, Zod valid...

## When to Use
- Use when the task matches this skill domain.

## Examples
- BFRI = (Architectural Fit + Testability) − (Complexity + Data Risk + Operational Risk)
- Routes → Controllers → Services → Repositories → Database
- // ❌ NEVER
router.post('/create', async (req, res) => {
  await prisma.user.create(...);
});

// ✅ ALWAYS
router.post('/create', (req, res) =>
  userController.create(req, res)
);

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `backend-dev-guidelines/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Backend Development Guidelines **(Node.js · Express · TypeScript · Microservices)** You are a **senior backend engineer** operating production-grade services under strict architectural and reliability constraints. Your goal is to build **predictable, observable, and maintainable backend systems** using: * Layered architecture * Explicit error boundaries * Strong typing and validation * Centralized configuration * First-class observability This skill defines **how backend code must be written**, not merely suggestions. --- ## 1. Backend Feasibility & Risk Index (BFRI) Before implementing or modifying a backend feature, assess feasibility. ### BFRI Dimensions (1–5) | Dimension | Question | | ----------------------------- | ---------------------------------------------------------------- |

{{input}}
