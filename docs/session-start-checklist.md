# Session Start Checklist

Use this checklist at the beginning of a session with any **active** provider (Claude Code, Cursor, Codex, or Gemini CLI).

Canonical protocol: [session-start.md](session-start.md)

Run `harness-start` to execute Session Start.

## Minimum Artifact Read Order

Read these in order when they exist:

1. `AGENTS.md`
2. `.harness/PROJECT.md`
3. `.harness/GOAL.md`
4. `.harness/STATE.md`
5. `.harness/CONTEXT.md`
6. `.harness/PLAN.md`
7. `.harness/VERIFY.md` if the work is near completion
8. `.harness/REMEMBER.md` if prior durable decisions may affect the task

## First Prompt Pattern

Use a first prompt like this:

> Read `AGENTS.md` and the active `.harness/` artifacts first. Tell me which harness command should run next, summarize the current goal and state, and do not start implementation until the goal and plan are clear.

## Minimum Session Checks

- [ ] The current goal is explicit
- [ ] The active state matches reality
- [ ] The next command in the loop is clear
- [ ] A plan exists before implementation starts
- [ ] Verification expectations are known if the task is in progress

## Stop Conditions

Stop and clarify before coding when any of these are true:

- the goal is ambiguous
- `.harness/PLAN.md` is missing for non-trivial work
- the recorded state conflicts with the codebase or current task
- verification requirements are unknown
- the work would require scope expansion that has not been discussed

## Safety Reminder

Do not store secrets, tokens, customer data, or private business data in harness artifacts.
