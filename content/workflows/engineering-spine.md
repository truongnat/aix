# The aix Engineering Spine

> The default, opinionated methodology aix gives a coding agent. It is **process
> skills sequenced into a flow** — not a runtime engine. The host agent executes
> it using its native subagents (Task tool). Entry point: the `using-aix` skill,
> injected at session start.

## The flow

| # | Step | Skill (invoke via `Skill` tool) | Purpose |
|---|------|----------------------------------|---------|
| 1 | Align & Shape | `discussing-pro` | Clarify goals, explore alternatives, surface spec in chunks |
| 2 | Plan | `planning-pro` | Task breakdown, dependencies, acceptance criteria, rollback |
| 3 | Isolate | `git-worktree-pro` | Branch + clean baseline |
| 4 | Test-first | `ttd-pro` | RED → GREEN → refactor |
| 5 | Execute | `executing-pro` | Dependency-aware task execution with checkpoints |
| 6 | Review | `code-review-pro` | Security + quality pass |
| 7 | Verify | `verify-pro` | Prove it works before "done" |
| 8 | Remember | `remember-pro` | Record what was learned |

**Supporting skills:** `mapping-codebase`, `debugging-investigation`,
`tool-discovery-skill`, `gatekeeper-skill`, `report-writer`, `writing-skills`.
**Operating contract:** `using-harness`.

**Session artifacts:** write spine outputs to `.aix/sessions/<session-id>/`
(`DISCUSSION.md`, `PLAN.md`, `REVIEW.md`, `VERIFY.md`, `REMEMBER.md`). Not `.planning/`.
See `content/skills/_shared/session-artifacts-contract.md`.

## Principles

- **Check for a relevant skill before any non-trivial task.** Skills are the
  proven path, not optional decoration.
- **Don't jump to code.** Steps 1–3 come first unless the task is genuinely quick.
- **Subagents do the work.** Dispatch focused subagents per plan task; review each
  for spec compliance first, then code quality.
- **The host agent is the runtime.** aix supplies the playbook and the library.

## Provenance

These process skills were consolidated from the merged source repos —
`ai-engineering-harness` and `agentic-sdlc` — and normalised into the aix skill
schema. The flow mirrors proven agentic-SDLC practice (brainstorm → plan → TDD →
subagent-driven execution → review → verify → remember).
