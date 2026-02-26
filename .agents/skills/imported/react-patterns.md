# Skill: react-patterns
Schema: antigrav.skill@v1

```json
{
  "description": "Modern React patterns and principles. Hooks, composition, performance, TypeScript best practices.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154397,
  "model": "qwen3:8b",
  "name": "react-patterns",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "react-patterns/SKILL.md",
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
Modern React patterns and principles. Hooks, composition, performance, TypeScript best practices.

## When to Use
- Use when the task matches this skill domain.

## Examples
- > Principles for building production-ready React applications.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `react-patterns/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# React Patterns > Principles for building production-ready React applications. --- ## 1. Component Design Principles ### Component Types | Type | Use | State | |------|-----|-------| | **Server** | Data fetching, static | None | | **Client** | Interactivity | useState, effects | | **Presentational** | UI display | Props only | | **Container** | Logic/state | Heavy state | ### Design Rules - One responsibility per component - Props down, events up - Composition over inheritance - Prefer small, focused components --- ## 2. Hook Patterns ### When to Extract Hooks | Pattern | Extract When | |---------|-------------| | **useLocalStorage** | Same storage logic needed | | **useDebounce** | Multiple debounced values | | **useFetch** | Repeated fetch patterns | | **useForm** | Complex form state |

{{input}}
