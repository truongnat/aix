# harness-map

## Purpose

Map the host repository, active `.harness/` artifacts, affected code areas, and current constraints before deeper work.

## Minimum Read Set

- `AGENTS.md`
- `.harness/STATE.md` if present
- active session `GOAL.md` if present
- active session `DISCUSSION.md` if present
- `.harness/HAZARDS.md` if present
- `.harness/INDEX.md` if present
- `.harness/REMEMBER.md` if present

## Preconditions

- The repository can be inspected safely.
- The operator is not already in the middle of approved implementation work that should continue under `harness-run`.

## When To Use

- at the start of a session in an unfamiliar repository
- before `harness-discuss` or `harness-plan`
- when `.harness/STATE.md` looks stale
- when impact scope is unclear

## Skills To Use

- `using-harness`
- `mapping-codebase`
- `remembering` when prior durable decisions affect the task

## Tool Discovery

- Read `.harness/TOOL_CONTEXT.md` first when it exists.
- Otherwise run `node scripts/discover-tools.js --markdown` when available.
- If the script is unavailable, manually check `git`, `rg`, `grep`, and any task-specific tools.

## Tool Routing

- use `rg` before `grep` when available
- use `git diff` and `git log` for repository context before asking the user for pasted context
- use code graph tools only when they are installed or configured
- if a required capability is unavailable, stop and return `Blocked` with a concrete fallback question

## Step-By-Step Workflow

1. Read root router artifacts first, then read the active session artifacts before inspecting code, with `.harness/HAZARDS.md` first when present.
2. Inventory the repository structure and identify likely entry points, boundaries, or ownership areas.
3. Determine which code, docs, or configs are likely to be affected by the active goal.
4. Separate observed facts from inferred structure.
5. Capture open questions, risks, and missing context in `.harness/CONTEXT.md` or `.harness/STATE.md`.
6. Stop once the repository is mapped well enough to discuss or plan without guessing.

## Required Outputs

- active session discussion or notes updated with observed facts, impact zones, and open questions
- an explicit statement of what should run next: `harness-discuss`, `harness-plan`, or `harness-start`

## Redirect Behavior

- If the current goal, state, or command is already clear from active artifacts, stop and redirect to the next needed command instead of remapping.
- If artifact conflicts are discovered, stop and redirect to `harness-discuss`.

## Failure Conditions

- Do not claim the repo is mapped if the affected area is still guesswork.
- Do not invent architecture, ownership, or system behavior.
- Do not drift into planning or implementation.

## Completion Gate

The command is complete when the relevant repository areas, active artifacts, likely impact zones, and major unknowns are explicit enough to support discussion or planning without invented facts.

## Artifact Paths

- Read: `.harness/INDEX.md`, `.harness/STATE.md`, `.harness/sessions/<active-session>/GOAL.md`, `.harness/sessions/<active-session>/DISCUSSION.md`, `.harness/HAZARDS.md`, `.harness/REMEMBER.md`
- Write: `.harness/sessions/<active-session>/DISCUSSION.md`, `.harness/sessions/<active-session>/NOTES.md`, `.harness/STATE.md`

## Human Approval

Ask for approval if the repository map shows the task is much broader than originally stated or if the active goal appears inconsistent with the current codebase state.

## Notes

`harness-map` is about situational awareness. It should not produce a plan and should not start implementation.
