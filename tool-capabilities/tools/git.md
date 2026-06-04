# git

## Purpose

Inspect repository history, diffs, and tracked state.

## Detect

```bash
git --version
```

## Use When

- reviewing changes
- checking tracked files
- reading history or blame context

## Do Not Use When

- the task is unrelated to repository state
- the user already provided the exact diff needed

## Example Commands

```bash
git status --short
git diff --stat
git log --oneline -n 20
```

## Fallback

- ask the user for commit or diff context
- inspect changed files directly if git metadata is unavailable

## Blocking Conditions

- block only when repository history or diff context is required and cannot be reconstructed safely
