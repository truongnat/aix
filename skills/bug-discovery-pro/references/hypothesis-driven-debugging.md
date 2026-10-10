# Hypothesis-driven debugging

Senior debugging is **belief updating**, not single-shot guesses.

## Loop

1. **Hypothesis** — Clear statement (“race between A and B”, “stale cache after deploy”).
2. **Prediction** — What you should see if true (logs, metrics, failing test assertion).
3. **Experiment** — Minimal change to observe (span attribute, metric, targeted test).
4. **Result** — Confirm / falsify / inconclusive.
5. **Update** — Adjust confidence; prune dead branches — ties **`bug-candidates-and-confidence.md`**.

## Evidence quality

- **Confirmed** — Repro + code path + (optional) fix verified.
- **Likely** — Strong correlation, one unexplained gap.
- **Hypothesis** — Plausible, not yet tested.

## Anti-pattern

- **Confirmation bias** — Only searching for proof, not falsification.

## Pairing with GitNexus

Use **`impact`** / **`query`** to **generate hypotheses** (“who else shares this?”), not to **prove** correctness.
