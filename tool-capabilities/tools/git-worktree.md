# git worktree

## Purpose

Create isolated parallel working directories without disturbing the current branch checkout.

## Detect

```bash
git worktree --help
```

## Use When

- comparing two implementation approaches
- reviewing base and head in parallel
- isolating risky refactors from the current workspace

## Do Not Use When

- the current workspace is already sufficient
- the task is small and does not benefit from isolation
- filesystem churn would create unnecessary confusion

## Example Commands

```bash
git worktree list
git worktree add ../repo-review main
```

## Fallback

- use a normal branch workflow
- use stash or patch-based comparison if isolation is still needed

## Blocking Conditions

- block only when safe parallel isolation is required and the fallback workflow would be too risky
