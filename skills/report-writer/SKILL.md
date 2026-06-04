---
id: report-writer
name: Report Writer
status: active
scope: core
version: 1
can_block: true
can_write: true
inputs:
  - PLAN.md
  - TASKS.md
  - VERIFY.md
  - git diff
  - git status
outputs:
  - REPORT.md
  - PR_MESSAGE.md
  - CHANGE_SUMMARY.md
tools:
  - git
---

# Report Writer Skill

## Purpose

Create PR-ready and daily-development reports from actual changes and verification evidence.

## When To Use

Use this skill at the end of daily development work, after implementation and verification, before opening a pull request or reporting progress.

## When Not To Use

Do not use this skill when:

- there are no code or doc changes
- verification is missing
- git diff cannot be inspected
- the user only asks for brainstorming or planning

## Inputs

- Approved plan
- Task list
- Verification artifact
- Git status
- Git diff summary
- Changed files

## Procedure

1. Read the active session state.
2. Read PLAN, TASKS, and VERIFY.
3. Run `node scripts/generate-report-context.js --json` or inspect git status and diff directly.
4. Group changes by purpose.
5. Produce `REPORT.md`.
6. Produce `PR_MESSAGE.md`.
7. Produce `CHANGE_SUMMARY.md`.
8. Do not overclaim verification.

## Output Contract

Must produce:

- Summary
- What changed
- Why changed
- Files changed
- Verification
- Risks
- Follow-ups
- PR title and body

## Blocking Conditions

Block if:

- verification is missing or blocked
- diff cannot be inspected
- changed files are unknown
- no meaningful change exists

## Common Failure Modes

- Listing files without explaining why.
- Claiming tests passed without evidence.
- Writing a PR message too vague for reviewers.
- Omitting risks or follow-ups.

## References

- `references/daily-report-template.md`
- `references/pr-message-template.md`
- `references/change-summary-template.md`
- `prompt.md`
