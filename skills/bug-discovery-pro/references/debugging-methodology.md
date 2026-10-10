# Debugging methodology

Structured pipeline from symptom to regression prevention. **Static/graph discovery** is one **narrowing** tactic — not the whole pipeline.

## Phases

1. **Observe** — Capture **symptom**, scope (user path, env, version), severity, **when started** (deploy, flag, traffic).
2. **Reproduce** — Smallest deterministic repro; note **intermittent** vs **always** — pair **`testing-pro`**.
3. **Narrow scope** — Layer (UI, API, DB, infra, client); bisect commits or deps when useful.
4. **Hypothesize** — Form **falsifiable** guesses; rank by likelihood — **`hypothesis-driven-debugging.md`**, **`bug-taxonomy.md`**.
5. **Validate** — Experiments: extra logging, toggles, traffic copy, graph impact, unit test on suspected path — **`runtime-debugging.md`**.
6. **Fix (handoff)** — Implement in the right **`*-pro`** skill; **this skill** does not own framework patches.
7. **Prevent regression** — Add test, contract check, alert, or runbook — **`testing-pro`**, **`api-design-pro`** for drift.

## When graph-first is wrong order

If the failure is **production-only** or **timing-sensitive**, start from **telemetry** (**`runtime-debugging.md`**, **`observability-integration.md`**) before deep graph walks.

## Review checklist

- [ ] Repro status explicit (**yes** / **partial** / **no**).
- [ ] Regression prevention mentioned when fix is identified.
