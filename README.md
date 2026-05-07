# Skills Devkit

Production-grade agent skills, workflows, and knowledge base for AI-assisted development.

---

## Quick Start

**Install into your project:**
```bash
npx github:truongnat/skills
```

---

## What You Get

- **92 Skills** - Domain-specific capabilities (React, Docker, TypeScript, Security, etc.)
- **20 Workflows** - Structured procedures organized by domain (dev, ops, qa, data, hr)
- **Knowledge Base** - RAG-powered documentation search
- **Project Indexing** - Index any codebase + generate wiki

---

## Key Commands

```bash
# Skills
/list-skills
/validate-skills
/analyze-skills

# Knowledge Base
/build-kb
/query-kb "your question"

# Project Indexing
/index-project --dir . --out .project-index
/generate-wiki --docs .project-index/docs

# Workflows (in Cursor/Claude)
/ticket
/release
/code-review
/debug
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Skills Devkit                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Skills     │  │  Workflows   │  │   Knowledge Base    │  │
│  │              │  │              │  │                      │  │
│  │ • 92 skills  │  │ • 20 flows   │  │ • Documents          │  │
│  │ • SKILL.md   │  │ • Domain-    │  │ • Embeddings (.index) │  │
│  │ • Scripts/   │  │   organized  │  │ • Manifest (.json)   │  │
│  │ • Reference  │  │ • Step-by-   │  │ • RAG Search         │  │
│  │              │  │   step       │  │                      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                  │                     │               │
│         └──────────────────┴─────────────────────┘               │
│                            │                                     │
│                            ▼                                     │
│                  ┌───────────────┐                               │
│                  │  CLI Tools    │                               │
│                  │               │                               │
│                  │ • validate-   │                               │
│                  │   skills      │                               │
│                  │ • build-kb    │                               │
│                  │ • query-kb    │                               │
│                  │ • index-      │                               │
│                  │   project     │                               │
│                  └───────┬───────┘                               │
│                          │                                       │
│                          ▼                                       │
│                  ┌───────────────┐                               │
│                  │  Agent Layer  │                               │
│                  │               │                               │
│                  │ • Skill       │                               │
│                  │   Routing     │                               │
│                  │ • Workflow    │                               │
│                  │   Execution   │                               │
│                  └───────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Overview

- **Skills**: Domain-specific capabilities (React, Docker, TypeScript, Security, Finance, etc.)
- **Workflows**: Structured procedures organized by domain (dev, ops, qa, data, hr, finance)
- **Knowledge Base**: RAG-powered documentation search with embeddings and manifest
- **CLI Tools**: Command-line interface for validation, indexing, and querying
- **Agent Layer**: Skill routing and workflow execution for AI agents

---

## Structure

```
skills/          # 92 skill packs
workflows/        # Domain-organized workflows (dev, ops, qa, data, hr, finance)
knowledge-base/   # Documents + embeddings
src/              # TypeScript source
dist/             # Compiled JS
```

---

## Documentation

- [Full CLI Reference](scripts/README.md)
- [Workflow Guide](workflows/README.md)
- [Skill Authoring Rules](skills/SKILL_AUTHORING_RULES.md)
- [Agent Integration](AGENTS.md)

---

## License

MIT
