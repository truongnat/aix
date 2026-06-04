# harness-remember

## Purpose

Capture durable, reusable, non-sensitive lessons after verified work or a meaningful failed attempt.

## Minimum Read Set

- active session `VERIFY.md`
- active session `SHIP.md` if present
- active session current `PLAN-*.md` if present
- `.harness/DECISIONS.md` if present
- `.harness/HAZARDS.md` if present
- `.harness/INDEX.md` if present
- `.harness/REMEMBER.md` if present

## Preconditions

- There is either a shipped result, a failed attempt, or a lesson worth preserving.
- The lesson can be written safely without storing secrets or private business data.

## Session Start Requirement

If active session is unknown or `.harness/STATE.md` has not been established for this chat, stop and run or redirect to `harness-start`. Do not write durable memory until Session Start completes.

## When To Use

- after verified work ships
- after a failed attempt reveals a durable hazard or root cause
- when future sessions would benefit from a durable note

## Skills To Use

- `using-harness`
- `remembering`
- `code-review` when the memory depends on verified findings

## Step-By-Step Workflow

1. Review the outcome, not just the implementation steps.
2. Extract the durable lesson, decision, root cause, or hazard.
3. Remove transient details and anything sensitive.
4. Write the lesson into the right memory artifact: `DECISIONS.md`, `HAZARDS.md`, `INDEX.md`, or goal-level `REMEMBER.md`.
5. Confirm the note is safe, durable, and reusable.

## Required Outputs

- updated typed memory artifact(s) and/or active session `REMEMBER.md`
- `.harness/STATE.md` updated if memory affects future execution
- a concise durable lesson or hazard note

## Redirect Behavior

- If the outcome is not yet verified or summarized, stop and redirect to `harness-verify` or `harness-ship`.
- If the note is still transient status rather than durable memory, stop and keep it in state or ship artifacts instead.

## Failure Conditions

- Do not save transient execution noise.
- Do not store credentials, tokens, customer data, or private business data.
- Do not write memory before the outcome is understood well enough to generalize safely.

## Completion Gate

The command is complete when a future operator can recover the important lesson without replaying the whole session and without exposing sensitive information.

## Artifact Paths

- Read: `.harness/STATE.md`, `.harness/sessions/<active-session>/VERIFY.md`, `.harness/sessions/<active-session>/SHIP.md`, `.harness/sessions/<active-session>/PLAN-*.md`, `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`, `.harness/sessions/<active-session>/REMEMBER.md`
- Write: `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`, `.harness/sessions/<active-session>/REMEMBER.md`, optional `.harness/STATE.md`

## Human Approval

Ask for approval if the only useful lesson depends on sensitive business context that cannot be safely generalized.

## Hooks & Skills

- Run `node hooks/core/compact-session-memory.js --session <active-session>` to propose durable updates for `.harness/MEMORY.md`.
- Archive session-only skills with `node hooks/core/archive-session-skill.js`; dispose means archive/deactivate, not delete.
- Promote reusable session skills to `.harness/memory/skills/` only with explicit reason.
- Record skill usage with `node hooks/core/record-skill-run.js` when a composed workflow finishes.
- Use existing core skills (`code-review`, `verification`) only when their output informs durable memory; do not create a session skill unless the lesson includes a repeatable procedure.

## Notes

`harness-remember` is not a transcript archive. It is a durable knowledge filter.
