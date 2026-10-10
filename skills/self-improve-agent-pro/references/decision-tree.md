# Self-improve agent — decision tree

## Signal quality

- **Sparse feedback** → Instrument more before tuning prompts.
- **Rich failures** → Taxonomy + targeted intervention.

## Change policy

- **High risk** (prod agent) → One change + shadow/canary.
- **Dev sandbox** → Faster iteration with logged runs.

## Verification

- **No baseline** → Measure first; avoid placebo “improvements.”

## Eval hygiene

```
Eval tasks drawn from same pool as training / prompt tuning text?
├── Yes → risk of leakage / overfit — rotate holdout; fresh external cases — **`failure-modes-detection-mitigation.md`**
└── No → still rotate evals periodically; production shadow slice when possible
```

## Multiple simultaneous changes

```
Must ship several fixes tonight?
├── Prefer isolate + queue; if unavoidable → factorial or explicit risk acceptance — **`failure-modes-detection-mitigation.md`**
└── Otherwise → one change per release window for attribution
```
