---
name: using-git-worktrees
description: 'Skill: using-git-worktrees'
x-kind: process
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---
# using-git-worktrees

## Purpose

Use optional git worktree isolation when it materially reduces execution risk without making the harness depend on worktrees.

## When To Use

- before `harness-run` when the current branch is risky to disturb
- when concurrent implementation threads need clean isolation
- when a plan explicitly calls for isolated execution

## When Not To Use

- when the task is planning, review, or verification only
- when the repo is already safely isolated enough for the planned change
- when the runtime or environment cannot support worktrees and in-place execution is acceptable

## Inputs

- approved plan
- current repository status
- any team rule about branch or worktree usage

## Workflow

1. Decide whether isolation is actually needed for this run.
2. Prefer an existing native or team-approved isolation mechanism.
3. If using a project-local worktree, verify it will not pollute tracked files.
4. Record the chosen execution context in state or task notes when it affects the workflow.
5. Continue with normal execution and verification discipline.

## Operating Principles

- Isolation is a tool, not a mandatory ritual.
- Prefer the least disruptive safe setup.
- Never hide worktree assumptions from the user or artifacts.
- Keep the harness portable across providers.

## Reasoning Procedure

1. Restate the isolation need and the branch/worktree constraints.
2. Check the existing repo state before creating or switching worktrees.
3. Pick the smallest safe git action for the current change.
4. Stop and report blocked if isolation cannot be established safely.

## Action Loop

- Thought: identify the next branch or worktree step.
- Action: inspect, create, switch, or clean the worktree.
- Observation: record the real git state before proceeding.
- Repeat until the work is isolated or blocked.

## Examples

### Example 1

Input: A prompt-content pass is risky to do in the main checkout.

Output:
- Decision about isolation: use a separate worktree only if parallel edits would collide.
- Chosen execution context: keep the current checkout if the changes are confined to markdown files.
- Constraints: preserve the dirty unrelated worktree state.

### Example 2

Input: The repo state makes safe isolation impossible right now.

Output:
- Blocked: cannot establish a safe isolated worktree.
- Needed next step: resolve the conflicting state before splitting work.
## Output Contract

This skill must produce:

- a clear decision about isolation
- the chosen execution context when relevant
- any constraints the executor must preserve

## Common Failure Modes

- creating worktrees automatically when they are unnecessary
- polluting the repo with tracked worktree directories
- treating lack of worktree support as a blocker for ordinary tasks

## Checklist Before Done

- [ ] Isolation need was evaluated
- [ ] The chosen setup matches repo risk
- [ ] No tracked-file pollution was introduced
- [ ] The execution context is documented if relevant
- [ ] Work can proceed without hidden assumptions
