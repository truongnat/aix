# Hooks & Dynamic Skills Layer

## Purpose

Document the harness runtime layer for hooks, dynamic session skills, skill workflows, and disposal.

This module is separate from command docs. Commands describe phase behavior; this layer describes enforcement, recording, capability packaging, and lifecycle.

## Final positioning

```txt
Hooks enforce and record.
Skills package reusable capability.
Workflows compose skills.
Dispose means archive/deactivate, not delete.
```

## Architecture

```txt
hooks/core/          portable Node scripts
hooks/providers/     provider-specific adapter docs
skills/              core capability packages
workflows/           ordered skill composition
templates/           skill/workflow lifecycle artifacts
```

## Hooks

See [hooks/README.md](../hooks/README.md).

Core scripts:

- `guard-phase.js`
- `record-tool-output.js`
- `record-subagent-result.js`
- `record-skill-run.js`
- `archive-session-skill.js`
- `compact-session-memory.js`

## Provider hook support

| Provider | Support |
|----------|---------|
| Claude | native hook adapter installed into `.claude/settings.json` for project installs |
| Cursor | rules/prompt fallback |
| Codex | AGENTS/prompt fallback |
| Gemini | extension context / prompt fallback |

## Skills

Core skills live in `skills/`. Session skills live under:

```txt
.harness/sessions/<session>/skills/<skill-id>/
```

Lifecycle:

```txt
draft → active → used → archived/disposed → promoted
```

See [skill-lifecycle.md](skill-lifecycle.md).

## Workflows

- `workflows/create-skill.md`
- `workflows/compose-skills.md`
- `workflows/review-and-verify.md`
- `workflows/release-readiness.md`

## Related

- [delegated-workers.md](delegated-workers.md)
- [provider-rule-configuration.md](provider-rule-configuration.md)
