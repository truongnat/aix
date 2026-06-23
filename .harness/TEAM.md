# Team Profile

## Purpose

Describe who owns the repository, who reviews changes, and how handoffs work.

## Current Status

- Status: draft
- Primary maintainer:
- Backup reviewer:
- Escalation channel:

## Selected Pattern

- Small scoped changes with explicit verification
- Human approval for scope changes and destructive actions
- Evidence-first ship decisions

## Roles

| Role | Responsibilities | Notes |
| --- | --- | --- |
| Maintainer | approves plan and ship decisions |  |
| Implementer | edits code and records verification |  |
| Reviewer | checks regressions and risks |  |

## Handoff Rules

- Update `STATE.md` with current phase
- Link the active `GOAL.md` and `PLAN.md`
- Record unfinished checks in `VERIFY.md` or `BLOCKED.md`

## Escalation Rules

- Acceptance criteria change
- Destructive migration or data loss risk appears
- Verification is blocked by missing credentials, infra, or production access

## Human Review

List pending staffing, ownership, or escalation gaps that need human review.
