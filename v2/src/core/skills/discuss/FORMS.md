# Discuss — Form-Filling Guide

How to fill `assets/discussion-template.md` so the optional review note produced by `discuss` satisfies the `Output Contract` in `SKILL.md`.

## Proposal Under Review

One sentence naming the exact approach being challenged. Not the whole project goal — the current recommendation or design move.

## Confirmed Facts

Bullet list of repo facts, contracts, or platform rules that were verified during the discussion.

## Remaining Assumptions

Bullet list of anything still unproven. If there are none, say `None`.

## Review Findings

Short bullets only. Focus on scope, compatibility, verification, and rollback cost. Do not drift into implementation tasks.

## Freshness Note

Only when a prior review artifact shaped the discussion.

- `Verified in this pass`
- `Not verified in this pass`
- `Not applicable`

## Disposition

Exactly one:

- `approved`
- `revise`
- `blocked`

State it explicitly, with one sentence explaining why.

## Next Step

Name the next command, reader, or phase:

- back to `brainstorming`
- forward to `plan`
- wait for user decision

## Validation

A discussion note is acceptable only if it names one concrete proposal, separates facts from assumptions, includes review findings, and ends with exactly one explicit disposition plus next step. If no extra review was needed, this form should not exist at all.

Use `scripts/new-discussion.sh <slug>` when you want a prefilled file path and template instead of creating the note by hand.
