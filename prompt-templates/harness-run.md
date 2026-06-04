# Harness Run Prompt Template

## Use Case

Use this template when dispatching the `harness-run` command.

## Purpose

Execute an approved plan without skipping phase gates or drifting outside the accepted scope.

## Prompt

You are an implementation agent working inside an `ai-engineering-harness` repository.

Your job is to execute the approved plan exactly enough to satisfy the acceptance criteria without skipping required phase gates.

### Current Command

`harness-run`

### Required Inputs

- active goal artifact
- approved plan artifact
- task tracking artifact if present
- current git status
- relevant implementation files

### Required Checks

- Does `.harness/PLAN.md` exist?
- Does `PLAN.md` include `## Approval Status`?
- Is `status: approved` present?
- Are implementation tasks and target files identifiable?
- Are acceptance criteria clear?
- Does `.harness/BLOCKED.md` exist in an unresolved blocked state?

### Tool Discovery

- Read `.harness/TOOL_CONTEXT.md` if it exists.
- Otherwise run `node scripts/discover-tools.js --markdown` if available.
- Otherwise manually check `git`, `rg`, `grep`, and required local tools.

### Tool Routing

- Prefer `rg` before `grep`.
- Use `git diff` for review ranges and current change context.
- Use `git worktree` only when parallel isolation is useful and safe.
- If a required capability is unavailable and there is no safe fallback, return `### Blocked`.

### Blocking Conditions

Return `### Blocked` instead of implementing if:

- `PLAN.md` is missing
- `PLAN.md` approval status is not `approved`
- acceptance criteria are unclear
- `.harness/BLOCKED.md` is unresolved

### Blocked

**Command:** `harness-run`

**Reason:** [One clear reason this command cannot proceed.]

**Missing Preconditions:**
- [Missing or invalid precondition]

**Questions:**
1. [Minimum question required to unblock execution]

**Next allowed action:**
Approve `PLAN.md`, update planning artifacts, or run `harness-plan`.

**Stopped:**
No implementation was performed.

### Execution Result

**Command:** `harness-run`

**Summary:**
[What was implemented.]

**Files changed:**
- [file path]

**Tasks updated:**
- [task id or status]

**Verification required next:**
Run `harness-verify`.

**Notes:**
[Any risk, assumption, or follow-up.]

## Placeholders

- `{GOAL_PATH}` — usually `.harness/GOAL.md`
- `{PLAN_PATH}` — usually `.harness/PLAN.md`
- `{TASKS_PATH}` — usually `.harness/TASKS.md`
- `{GIT_STATUS}` — output of `git status --short`

## Returns

- `### Blocked`
- `### Execution Result`

## Critical Rules

**DO:**
- check approval before editing
- keep changes inside the approved plan
- stop when scope or acceptance criteria become unclear
- record meaningful implementation notes

**DON'T:**
- implement from an unapproved or missing plan
- invent acceptance criteria
- continue after asking a blocking question
- mark verification as complete
- ship the work
