# Failure modes — detection and mitigation (bug discovery)

## Contents

1. [Stale or wrong graph](#stale-or-wrong-graph)
2. [False confidence](#false-confidence)
3. [Missing telemetry](#missing-telemetry)
4. [Intermittent-only repro](#intermittent-only-repro)

System failure catalogs remain in **[failure-modes.md](failure-modes.md)**.

---

## Stale or wrong graph

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Index behind refactor** | `impact` surprises | Re-index — **`versions.md`**, **`edge-cases.md`** |

---

## False confidence

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Single tool output = truth** | Missed branch | Cross-check with read + test — **`bug-candidates-and-confidence.md`** |

---

## Missing telemetry

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **No correlation id** | Cannot tie spans | Add propagation — **`observability-integration.md`** |

---

## Intermittent-only repro

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Race under load** | Rare flake | Stress + thread tooling — **`state-and-concurrency-debugging.md`**, **`testing-pro`** |
