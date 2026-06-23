# Verify — Form-Filling Guide

How to fill `assets/verify-report-template.md`. The first half proves the work; the second half (`Finalization`) is filled only once the claim is clean and `scripts/check-claims.sh` passes.

## Claim

One sentence, specific. "All 3 install-flag tasks done and verified" — not "looks good."

## Claim-to-Evidence Match

One row per task from the execution log. `Evidence checked` must name what you actually looked at (re-ran the test, read the log row, inspected the diff) — not "trusted the done status." `Result` is `pass`, `fail`, or `unproven`.

## Success Criteria Match

Pull the criteria straight from the original brief. A criterion with no matching evidence is `unmet`, not skipped.

## Status

Only check a box when every row above supports it. `scripts/check-claims.sh` enforces this — leave an item unchecked rather than checking it on faith. If any box is unchecked, stop at `Blockers`; do not fill `Finalization`.

## Finalization (only when clean)

- **Junk cleaned** — list the scratch/temp/debug files you created during the work and removed before committing. If there were none, say so.
- **What changed / Why** — what was verified, and the reason from the brief/plan (the why, not a diff restatement).
- **Commit** — fill the hash/PR link only after the commit exists; commit only what was verified, branch first if on the default branch.
- **Next step** — at least one row: the action (merge, release, review) and exactly one owner.

## Validation

The report is acceptable only if every evidence row names a real check, and — when finalized — the tree was cleaned, the commit is scoped to the verified work, and the next step has a named owner.
