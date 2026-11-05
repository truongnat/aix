# Data analysis — anti-patterns

## Leakage from future information

- Train metrics inflated; production fails.
- **Fix:** Time-based splits; pipeline isolation.

## Silent type coercion

- Dates parsed wrong; categoricals become strings inconsistently.
- **Fix:** Explicit dtypes; assert ranges.

## Chart without axis context

- Misleading scales.
- **Fix:** Units, zero baseline, sample size in caption.

## p-hacking narrative

- Many tests, one significant by chance.
- **Fix:** Pre-register hypotheses or adjust; show full result set.

## Excel as source of truth

- Manual edits drift from exported CSV.
- **Fix:** Pin file hash or use controlled export.

## Metric without denominator

- “Conversion up 20%” — from what base?
- **Fix:** Always report **n** and window — **`quality-validation-and-guardrails.md`**.
