# Decision framework and trade-offs (testing)

## Contents

1. [More integration vs more mocks](#more-integration-vs-more-mocks)
2. [E2E breadth vs CI time](#e2e-breadth-vs-ci-time)
3. [Snapshots vs explicit assertions](#snapshots-vs-explicit-assertions)
4. [Contract tests vs full e2e](#contract-tests-vs-full-e2e)

Use **`decision-tree.md`** for layer selection.

---

## More integration vs more mocks

| More **integration** | More **mocks** |
|----------------------|----------------|
| Higher confidence in wiring | Faster, more isolated |

**Trade-off:** integration flakiness vs **false green** from over-mocking — **`failure-modes-detection-mitigation.md`**.

---

## E2E breadth vs CI time

| Broad E2E on every PR | Narrow smoke + nightly full |
|-----------------------|----------------------------|
| High confidence per PR | Sustainable latency |

**Trade-off:** ship speed vs regression catch — document policy — **`automation-and-ci.md`**.

---

## Snapshots vs explicit assertions

Snapshots are cheap to write, expensive to **review** — prefer **role/label** assertions for UX-critical paths — **`tips-and-tricks.md`**.

---

## Contract tests vs full e2e

**Pact/OpenAPI** checks service boundaries with less UI cost than full browser e2e — use for **microservice** graphs — **`nestjs-pro`** for HTTP harness wiring.
