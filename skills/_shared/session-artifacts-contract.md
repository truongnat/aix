# Session artifacts contract (aix spine)

Canonical location for engineering-spine outputs. **Not** `.planning/` (that is GSD / other harnesses).

## Root path

```
.aix/sessions/<session-id>/
```

Engine source of truth: `packages/engine/src/session-store.ts` (`SESSIONS_ROOT`).

## Session ID

1. Pick a short **kebab-case** slug from the task (e.g. `lac-hong-feedback-v2`).
2. **Resuming work:** reuse the existing folder under `.aix/sessions/` for the same task.
3. **New task:** `mkdir -p .aix/sessions/<session-id>/` before writing the first artifact.

## Spine artifacts (by phase)

| Phase | Skill | File |
|-------|-------|------|
| Align & Shape | `discussing-pro` | `DISCUSSION.md` |
| Plan | `planning-pro` | `PLAN.md` |
| Review | `code-review-pro` | `REVIEW.md` |
| Verify | `verify-pro` | `VERIFY.md` |
| Remember | `remember-pro` | `REMEMBER.md` |

Also in the same folder (engine / long runs):

- `state.json`, `checkpoint.log`
- `archive/` — previous versions when regenerating (move old file here with timestamp)
- `generated/` — sandbox code from headless `@x/engine` (review before applying to workspace)

## Save rules

- Write **only** under `.aix/sessions/<session-id>/` unless the user explicitly asks for another path.
- When regenerating, archive the prior file to `archive/<NAME>.<timestamp>.md` and link it at the top of the new file.
- Do **not** write spine artifacts to `.planning/`, repo root, or `docs/` by default.

## Related

- Rule: `content/rules/core/spine-guardrail.md`
- Entry: `content/skills/using-aix/SKILL.md`
