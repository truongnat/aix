# harness-start

## Purpose

Run the **Session Start** protocol: the mandatory boot sequence that restores context, routes the active session, checks blocked state, loads memory, and determines the next allowed harness command before any implementation work begins.

## System Prompt Requirement

This command MUST be executed under the ai-engineering-harness system prompt.

Read:
- `.ai-harness/agent-system/SYSTEM_PROMPT.md`
- `.ai-harness/agent-system/RESPONSE_CONTRACT.md`

`harness-start` executes Session Start. It is not a casual opener — it is the entrypoint for establishing session state.

## Session Start Protocol

Session Start answers:

1. Is this a new session or a continuation?
2. What is the current goal?
3. Which durable memory must be loaded?
4. Is there blocked or unfinished work?
5. What is the next allowed command?

Protocol steps:

1. Load harness index.
2. Detect active session.
3. Inspect session state.
4. Load durable memory.
5. Check blocked and unfinished work.
6. Detect tool context.
7. Recommend next command.
8. Ask the user only if routing is ambiguous.

See `docs/session-start.md` for the full contract.

## Minimum Read Set

- `AGENTS.md`
- `.ai-harness/activation.md` if present
- `.harness/INDEX.md` if present
- `.harness/STATE.md` if present
- `.harness/MEMORY.md` if present
- `.harness/BLOCKED.md` if present
- active session `SESSION.md` if present
- active session `GOAL.md` if present
- active session `TASKS.md` if present
- active session `BLOCKED.md` if present
- active session current `PLAN-*.md` if present
- active session `VERIFY.md` if present
- active session `DISCUSSION.md` if present
- relevant `.harness/decisions/` and `.harness/hazards/` entries

## Preconditions

- The agent session is beginning, resuming, or switching to a new repository area.
- No implementation should start until Session Start completes and the next command is explicit.

## When To Use

- at the start of a new task or chat
- when the user says "continue" or asks "what next?"
- when resuming paused work
- when active session or `.harness/STATE.md` is unknown
- before plan, run, verify, ship, or remember if session state has not been established

## Skills To Use

- `using-harness`
- `mapping-codebase`
- `discussing-goals` when the goal is still ambiguous

## Step-By-Step Workflow

1. Read `.harness/INDEX.md`, `.harness/STATE.md`, and durable memory before touching code.
2. Detect whether an active session already exists under `.harness/sessions/<active-session>/`.
3. Inspect session artifacts: `SESSION.md`, `GOAL.md`, `TASKS.md`, current `PLAN-*.md`, `VERIFY.md`, and blockers.
4. Decide whether to continue the active session, start a new session, or archive the old session and start a new one.
5. Refresh `.harness/STATE.md` and `.harness/INDEX.md` if routing state is stale, including `last_session_start`.
6. Write or update active session `SESSION_START.md` using `templates/SESSION_START.md`.
7. Return a Session Start summary with explicit next command. Do not implement code.

## Required Outputs

- active session `SESSION_START.md` or equivalent Session Start summary using `templates/SESSION_START.md`
- `.harness/STATE.md` updated if stale, including active session, phase, next allowed command, blocked status, and `last_session_start`
- `.harness/INDEX.md` updated if stale
- one explicit next command
- routing question only when continuation vs new session is ambiguous

## Redirect Behavior

- If the repository is unfamiliar and impact scope is unclear, redirect to `harness-map`.
- If no current goal exists, redirect to `harness-discuss`.
- If a valid approved plan exists and execution is the next step, redirect to `harness-run`.
- If verification is the next step, redirect to `harness-verify`.

## Failure Conditions

- Do not treat `harness-start` as implementation.
- Do not claim Session Start is complete if active session or next command is still ambiguous without asking the user.
- Do not assume the previous session ended cleanly without checking active session artifacts and blockers.
- Do not continue if both flat root working artifacts and session-local working artifacts appear active.

## Completion Gate

Session Start is complete when the agent has a clear active session (or explicit no-session routing), loaded context, surfaced blockers, and an explicit next command.

## Artifact Paths

- Read: `.harness/INDEX.md`, `.harness/STATE.md`, `.harness/MEMORY.md`, `.harness/BLOCKED.md`, `.harness/sessions/<active-session>/SESSION.md`, `.harness/sessions/<active-session>/GOAL.md`, `.harness/sessions/<active-session>/TASKS.md`, `.harness/sessions/<active-session>/BLOCKED.md`, `.harness/sessions/<active-session>/PLAN-*.md`, `.harness/sessions/<active-session>/VERIFY.md`
- Write: `.harness/STATE.md`, `.harness/INDEX.md`, `.harness/sessions/<active-session>/SESSION_START.md`

## Human Approval

Ask for approval if the previously recorded plan is invalid and a materially different direction is required, or if the user must choose between continuing, starting fresh, or archiving the current session.

## Notes

Use `harness-start` to run Session Start at session boundaries. Root `.harness/` is the router; sessions own working artifacts. Other commands must not proceed with unknown session state — redirect here first.
