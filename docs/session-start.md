# Session Start

## Purpose

Session Start is the required boot sequence for an AI agent before doing project work.

It prevents the agent from starting with stale, missing, or incorrect context.

```txt
Session Start = boot sequence before any plan/run/verify/ship work
harness-start   = command that runs the Session Start protocol
```

Session Start must determine:

- active session
- current goal
- current phase
- unresolved blocked state
- loaded durable memory
- next allowed command

Do not implement, verify, or ship before session state is established.

## When It Runs

Run Session Start when:

- a new chat or agent session begins
- the user says "continue" or "run tiếp đi"
- the user asks "what next?"
- the agent enters a repository with `.harness/`
- the active session is unknown
- there is unresolved work from a previous session
- a downstream command depends on `.harness/` state but routing is unclear

## Required Read Order

Read in order when files exist:

1. `.ai-harness/activation.md` or installed activation surface
2. `AGENTS.md`
3. `.harness/INDEX.md`
4. `.harness/STATE.md`
5. active session `SESSION.md`
6. active session `GOAL.md`
7. active session `TASKS.md`
8. active session `BLOCKED.md` if present
9. root `.harness/BLOCKED.md` if present
10. active session latest `PLAN-*.md`
11. active session `VERIFY.md` if present
12. `.harness/MEMORY.md`
13. relevant files under `.harness/decisions/`
14. relevant files under `.harness/hazards/`

Optional when near completion or for tool routing:

- `.harness/TOOL_CONTEXT.md`
- `node scripts/discover-tools.js --markdown`

## Session Start Protocol

```txt
Session Start
├─ 1. Load harness index
├─ 2. Detect active session
├─ 3. Inspect session state
├─ 4. Load durable memory
├─ 5. Check blocked / unfinished work
├─ 6. Detect tool context
├─ 7. Recommend next command
└─ 8. Ask user if routing is ambiguous
```

## Session Routing Behavior

When `harness-start` runs Session Start:

1. Read router files and detect whether an active session exists under `.harness/sessions/<active-session>/`.
2. If an active session exists, inspect `SESSION.md`, `GOAL.md`, `TASKS.md`, current `PLAN-*.md`, `VERIFY.md`, and blockers.
3. Decide whether to:
   - continue the existing session
   - start a new session
   - archive the old session and start a new one
4. Refresh `.harness/STATE.md` and `.harness/INDEX.md` when stale.
5. Write or update active session `SESSION_START.md` using `templates/SESSION_START.md`.
6. Stop with an explicit next command. Do not implement code.

Ask the user only when routing is genuinely ambiguous.

## Blocked State Detection

Session Start must inspect:

- `.harness/STATE.md` blocked fields
- root `.harness/BLOCKED.md`
- active session `BLOCKED.md`

If blocked state exists, surface it in the Session Start summary and route to the earliest safe command.

## Output

Session Start must produce:

- active session path
- current phase
- loaded memory summary
- blocked status
- unfinished work
- next allowed command
- routing question only when needed

Use `templates/SESSION_START.md` as the canonical output shape.

## Before Other Commands

If session state is unknown, run Session Start first.

This applies before:

- `harness-plan`
- `harness-run`
- `harness-verify`
- `harness-ship`
- `harness-remember`

If the user asks to plan, run, verify, ship, or remember but active session or state is unknown:

```md
### Blocked

**Reason:** Session state is unknown.

**Next allowed action:** Run `harness-start` (Session Start protocol).
```

## Examples

### Ready — continue existing session

```md
# Session Start

## Status

status: ready

## Active Session

`sessions/2026-06-04-command-guardrails`

## Current Phase

phase: verify

## Loaded Memory

- Cursor must not claim native slash commands.
- Ship is blocked until VERIFY.md has evidence.

## Next Allowed Command

`harness-verify`
```

### Needs routing — ask user

```md
# Session Start

## Status

status: needs-routing

## Existing Active Session

`sessions/2026-06-04-command-guardrails`

## Unfinished Work

- PLAN-001.md exists but is not approved.
- TASKS.md has 3 incomplete tasks.

## Next Allowed Command

`harness-plan`

## Routing Question

Do you want to continue the existing session or start a new session?

1. Continue `2026-06-04-command-guardrails`
2. Start a new session
3. Archive the current session and start new
```

## Related Docs

- Quick checklist: [session-start-checklist.md](session-start-checklist.md)
- Session memory: [session-memory.md](session-memory.md)
- Command: [../commands/harness-start.md](../commands/harness-start.md)
- Template: [../templates/SESSION_START.md](../templates/SESSION_START.md)
