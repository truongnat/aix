# Workflow Execution — How router-pro loads and sequences workflows

## Workflow sources

All runnable workflows live under `workflows/dev/<slug>.md`. Each file has YAML frontmatter with `id`, `version`, `description`, and `time_estimate`.

## Discovery

```
workflows/dev/
├── ticket.md       → /ticket
├── debug.md        → /debug
├── release.md      → /release
├── hotfix.md       → /hotfix
├── code-review.md  → /code-review
├── security-audit.md
├── arch-review.md
├── perf-investigation.md
├── refactor.md
├── incident.md
├── data-migration.md
├── onboarding.md
├── api-design.md
├── test-strategy.md
├── dep-audit.md
├── index-project.md
└── sync-kb.md
```

Command stubs in `commands/<slug>.md` map slash commands to workflow files. YAML `targets: [cursor, claude]` controls which IDEs receive the command.

## Routing logic

1. Parse query for explicit command (`/ticket`, `/debug`, etc.) → direct match.
2. If no explicit command, match query to workflow descriptions using keyword overlap.
3. Confirm workflow choice with user when ambiguous (two or more workflows score ≥ 0.7).
4. Load workflow file, read `## Steps` or numbered procedure, begin execution.

## Skill + workflow combination

Many workflows activate domain skills mid-execution:
- `/ticket` → activates `writing-plans-pro` (planning step) and the relevant domain skill (implementation step).
- `/debug` → activates `systematic-debugging-pro`.
- `/code-review` → activates domain skill(s) + `security-pro` + `testing-pro`.

`router-pro` owns the sequencing; domain skills own the domain-specific logic within each step.

## Stopping conditions

A workflow is done when:
- All required artifacts are produced (e.g. `kanban/<ticket>/meta.json` for `/ticket`).
- The user explicitly marks the workflow complete.
- A HITL gate is reached that requires human sign-off before proceeding.
