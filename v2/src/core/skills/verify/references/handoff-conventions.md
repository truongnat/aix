# Handoff Conventions

Reference for the finalization steps (5-7) of the `verify` `Workflow` — the work
formerly split into a separate "ship" step.

## Gate

Finalization does not start unless `scripts/check-claims.sh` passes on the report.
A commit built on an unresolved report is not a finalization, it's a guess that
something is done.

## Clean up junk first

Before committing, remove anything created during the work that isn't part of the
change: scratch files, debug logs, commented-out experiments, stray test artifacts,
temp output. A clean commit contains the change and nothing else. Check `git status`
for untracked files you introduced and deal with each — commit it if it belongs,
delete it if it was scratch.

## Commit scope

Commit only what was verified. Do not pick up an unrelated fix "while you're at it" —
that's new scope without a brief or plan. Log it for a future cycle instead.

## Commit message

Follow whatever convention the repo already uses (see recent `git log`). Explain
*why* the change exists, not just what changed — the diff already shows the what.
Don't invent a new convention per change; consistency beats cleverness.

## Naming the next step

Name the action (merge, release, follow-up review) and exactly one responsible owner.
Multiple owners for one step is how a step gets skipped because everyone assumed
someone else had it.

## Anti-patterns

- Committing with scratch/debug files still in the tree.
- "Ready for review" with no named reviewer.
- Bundling unrelated verified work into one commit because it finished around the same time — one commit chain per brief/plan/verify cycle.
- Treating the commit as the handoff — a commit with no stated next step leaves the reader guessing.
