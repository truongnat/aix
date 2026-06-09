# Provider Rule Configuration

## Purpose

Explain how ai-engineering-harness separates **core harness rules** from **provider adapters**.

Core harness rules are provider-neutral. Provider adapters install those rules into each provider's native configuration surface.

## Architecture

```txt
rules/core/                 ← shared contract fragments
        ↓
lib/provider-rule-renderer.js
        ↓
provider-specific entrypoints at install time
```

Claude and Cursor get project-native `/harness-*` command files. Codex uses plugin packaging with AGENTS fallback, and Gemini uses extension packaging with `GEMINI.md` context.

## Core Fragments

| File | Responsibility |
|------|----------------|
| `rules/core/command-naming.md` | Hyphen-form canonical command IDs |
| `rules/core/phase-guards.md` | Plan → run → verify → ship discipline |
| `rules/core/blocking.md` | Stop, ask, do not continue (gated phases only) |
| `rules/core/discussion.md` | Multi-turn discuss; structured questions; continue after answers |
| `rules/core/option-scoring.md` | Three options + 4-dimension scoring before user choice |
| `rules/core/provider-interaction.md` | Provider-native tools for user choice (not markdown-only) |
| `rules/core/session-memory.md` | STATE + sessions read order |
| `rules/core/tool-routing.md` | Tool discovery and capability routing |

Provider templates include `<!-- @core -->` markers. The renderer expands them at install/render time.

## Provider Adapters

| Provider | Rule entrypoints | Native `/harness-*` | Subagents |
|----------|------------------|--------------------:|----------:|
| Claude Code | `.claude/CLAUDE.md`, `.claude/commands/`, `.claude/agents/` | Yes (project commands) | Yes |
| Cursor | `.cursor/commands/`, `.cursor/rules/` | Yes (project commands) | No |
| Codex | `AGENTS.md` | No | No |
| Gemini | `.gemini/extensions/ai-engineering-harness/` (`GEMINI.md`) | No | No |
| Generic | `AGENTS.md` | No | No |

Source templates live under `rules/providers/<provider>/`, including `rules/providers/claude/command.md` for project-native Claude command files and `rules/providers/cursor/ai-engineering-harness-commands.mdc` for Cursor command routing.

## Install Mapping

Project install writes:

```txt
Claude  → .claude/CLAUDE.md + .claude/commands/harness-*.md + .claude/agents/harness-*.md
Cursor  → .cursor/commands/ + .cursor/rules/ (harness commands + guardrails)
Codex   → AGENTS.md
Gemini  → .gemini/extensions/ai-engineering-harness/
Generic → AGENTS.md (generic adapter)
```

Implementation:

- `lib/provider-rule-renderer.js` — compose core + provider templates
- `lib/install-runtime.ts` — write provider entrypoints
- `lib/runtime-command-catalog.js` — command catalog + merged provider metadata

## Fallback Instructions

| Provider | When native slash is unavailable |
|----------|----------------------------------|
| Cursor | Use harness-plan for this repository. |
| Codex | Use harness-plan for this repository. |
| Gemini | Use harness-plan for this repository. |
| Generic | Use harness-plan for this repository. |

## Debugging Installed Rules

1. Confirm `.ai-harness/activation.md` exists.
2. Check provider entrypoint files listed above.
3. Run `node bin/validate.js --target <path> --profile-only` for structural checks.
4. For Claude workers, confirm `.claude/agents/harness-*.md` includes `### Agent Result`.

## Related Docs

- [provider-command-matrix.md](provider-command-matrix.md)
- [claude-subagents.md](claude-subagents.md)
- [delegated-workers.md](delegated-workers.md)
- [runtime-command-surface.md](runtime-command-surface.md)
