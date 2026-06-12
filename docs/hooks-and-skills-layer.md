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
- `guard-scope.js`
- `guard-test-first.js`
- `guard-file-edits.js`
- `codex-hook-router.js`
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
| Codex | `codex-hook-router.js` enforces dangerous commands, scope guard, and test-first checks at PreToolUse |
| Gemini | extension context / prompt fallback |

## Runtime enforcement

`hooks/core/codex-hook-router.js` blocks on **edit-class tools** (`Write`, `Edit`, `MultiEdit`, `apply_patch`, `NotebookEdit`):

- out-of-scope file edits (via `guard-scope.js` when `.harness/STATE.md` has an active session)
- source edits that violate test-first discipline (via `guard-test-first.js` — hard deny; pattern grep only, does not run tests)

Read/search tools (`Read`, `Grep`, `Glob`, …) are not scope-guarded at the Codex router.

Claude hooks use `run-with-active-session.js`, which resolves `session:` from `.harness/STATE.md` (not backtick-only parsing).

Destructive shell commands (`git push --force`, `rm -rf`, …) are blocked separately.

Phase preconditions remain in `guard-phase.js` and provider-specific harness command hooks.

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
