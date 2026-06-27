# Self-improve agent — anti-patterns

## Prompt tweak without metrics

- Random drift.
- **Fix:** Before/after on fixed eval set.

## Many simultaneous changes

- Cannot attribute wins/losses.
- **Fix:** Single controlled variable per experiment.

## Overfitting the eval set

- Great on bench, fails in prod.
- **Fix:** Holdout + periodic refresh; monitor live regressions.

## Ignoring human review for high-stakes

- Compliance and safety gaps.
- **Fix:** HITL gate — **`feedback-pro`** for quality bar.
