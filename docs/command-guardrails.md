# Command Guardrails

`ai-engineering-harness` uses command docs as execution contracts, not just suggestions.

## Phase Order

`harness-map` / `harness-start` / `harness-discuss` -> `harness-plan` -> approved `PLAN.md` -> `harness-run` -> `harness-verify` -> `harness-ship` -> `harness-remember`

## Hard Stops

- `harness-run` must not start if `PLAN.md` is missing or not approved.
- `harness-verify` must not pass on "looks right" confidence.
- `harness-ship` must not claim success without explicit verification evidence.
- `harness-remember` must not run before there is a shipped result, failed attempt, or durable lesson.

## Blocking Questions

When a command lacks required input, the agent must stop and ask instead of guessing.

Typical blockers:

- approval missing
- acceptance criteria unclear
- verification command unknown
- manual review required
- failed test needs human judgment

Record blocked state in `.harness/BLOCKED.md` or `VERIFY.md` with `status: blocked`.

## Redirect Pattern

When preconditions fail:

1. Stop.
2. Name the missing artifact or state.
3. Name the correct next command.
4. Ask for the missing input when needed.

Expected phrasing:

```text
Blocked: precondition failed.
Run harness-plan first.
```
