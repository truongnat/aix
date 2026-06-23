---
name: verify
description: Use when a plan's work reports done — to prove it against evidence and, only if genuinely clean, finalize it (clean up, report, commit, hand off).
metadata:
  version: 0.2.0
---

## Skill name

verify

## Instruction

Match the claim being made about finished work against actual evidence, downgrading the claim rather than the evidence whenever they disagree. Only once the status is genuinely clean does this skill finalize the work: clean up junk created during the work, write a why-focused report and commit message, and commit — without re-opening scope.

## When to use

- all of a plan's tasks from `execute` report done and a completion claim is about to be made
- some checks were manual, partial, or deferred and could be glossed over under shipping pressure
- verified work needs to be finalized: cleaned up, committed, and handed off

## When not to use

- no implementation work exists yet to verify
- only brainstorming or planning has happened, with nothing implemented
- a prior `verify` pass already finalized this exact work and nothing changed since

## Inputs

- the plan's task list and each task's verification evidence
- the original brief's success criteria
- any known gaps or deferred checks
- repo conventions for commits, branches, and changelog

## Workflow

1. Restate the specific claim being made — "all tasks done and verified", not a vague "looks good".
2. Match each task's claimed verification against actual evidence produced by `execute`; re-run rather than trust a stale "passed" note.
3. Match the overall result against the original brief's success criteria, not just the task list.
4. Downgrade the status for any part that's unproven, blocked, or waiting on a human check. **If any blocker remains, stop here** — route back to `execute`; do not proceed to finalize.
5. Once the status is genuinely clean, finalize: remove junk/scratch files created during the work (debug output, temp files, stray artifacts) so they don't get committed.
6. Write the report (claim-to-evidence + what changed + why) and a commit message grounded in the brief/plan — explaining why, not restating the diff.
7. Commit per repo conventions, scoped to only what was verified (branch first if on the default branch), and state the explicit next step and its owner.

## Operating Principles

- Claims must not outrun the evidence actually produced; a pending human check is not a pass.
- Finalizing happens only after a genuinely clean verify — never commit over an open blocker.
- Commit only what was verified — no drive-by scope picked up "while committing".
- The commit message explains why; the report records the evidence; the tree is clean of scratch files first.

## Output Contract

This skill must produce:

- a claim-to-evidence report with an honest overall status
- if clean: a cleaned working tree, a why-focused commit scoped to the verified work, and an explicit next step with an owner
- if not clean: explicit blockers and a route back, with nothing committed

## Common Failure Modes

| Excuse | Reality |
|---|---|
| "Most tasks passed, so I'll call the whole thing done" | One unverified task makes the whole claim false. State it task by task. |
| "I manually checked it once, that's good enough" | Manual confidence is not regression evidence. Say it was manual, not that it was tested. |
| "While committing, I'll also fix this unrelated thing" | That's scope creep with no brief or plan. Commit only what was verified; log the rest. |
| "The diff speaks for itself, no message needed" | A diff shows what changed, not why. Write the why. |
| "I'll leave my scratch/debug files, they're harmless" | Junk files pollute the commit and the repo. Remove them before committing. |
| "I'll commit it, someone will follow up eventually" | An unnamed next step stalls finished work. Name the step and its owner. |

## Checklist Before Done

- [ ] The claim is stated specifically, not vaguely
- [ ] Every task's evidence was checked, not assumed from its done-status
- [ ] The result was matched against the original brief's success criteria
- [ ] Status was downgraded wherever proof was incomplete; no blocker remains before finalizing
- [ ] Junk/temp files created during the work were removed
- [ ] The change was committed with a why-focused message, scoped to only what was verified
- [ ] The next step and its owner are explicit

## Example

All 3 install-flag tasks show done. `verify` re-runs the integration test for task 2 instead of trusting the earlier "passed" note, confirms it passes, and checks the brief's success criterion ("existing installs are never silently overwritten") against the new `--force` behavior — clean pass. It then deletes a scratch file used while debugging, commits the `--force` work with a message explaining why (prevents silent overwrite of existing installs), and states the next step: "ready for PR review by the install-flow owner" — without touching the unrelated `versioning/index.ts` typo noticed along the way.

## Output

A claim-to-evidence report plus, when clean, a committed change with a why-focused message and an explicit next step — the closing record of the `brainstorming → plan → execute → verify` cycle.

## References

- `FORMS.md` — guide for filling the report and finalization sections
- `assets/verify-report-template.md` — report template (evidence + finalization)
- `scripts/check-claims.sh` — gates the report on unchecked items or unproven/fail results before finalizing
- `references/evidence-standards.md` — what counts as evidence vs. assumption
- `references/handoff-conventions.md` — junk cleanup, commit conventions, next-step owner
