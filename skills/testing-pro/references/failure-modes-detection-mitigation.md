# Failure modes — detection and mitigation (testing)

## Contents

1. [Flakiness](#flakiness)
2. [Layer mistakes](#layer-mistakes)
3. [CI and environment](#ci-and-environment)
4. [Assertions and maintenance](#assertions-and-maintenance)

---

## Flakiness

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Sleep-based sync** | Passes sometimes | Await network/UI; fake timers — **`edge-cases.md`** |
| **Shared mutable state** | Order-dependent failures | Isolate fixtures; transactions — **`decision-tree.md`** |
| **Retry-as-policy** | Hides root cause | Quarantine + fix; cap retries — **`anti-patterns.md`** |

---

## Layer mistakes

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **E2E-only suite** | Slow PRs, brittle | Move checks down pyramid — **`test-pyramid-and-strategy.md`** |
| **Mocking away the bug** | Green but prod breaks | Integration at real boundary — **`decision-framework-and-trade-offs.md`** |

---

## CI and environment

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Local-only pass** | Fails only in CI | Parity: Node, TZ, ports, seeds — **`automation-and-ci.md`** |
| **Secret leakage in logs** | Tokens in JUnit output | Redact; CI secret stores — **`security-pro`** |

---

## Assertions and maintenance

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Implementation-coupled tests** | Refactors break tests | Assert behavior/API — **`anti-patterns.md`** |
| **Oversized snapshots** | Noise on any UI tweak | Targeted snapshots or visual diff discipline — **`decision-framework-and-trade-offs.md`** |
