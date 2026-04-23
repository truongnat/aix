---
name: microservices-pro
description: |
  Production-grade microservices: bounded contexts, service boundaries, sync/async integration (RPC, events), data ownership, resilience (timeouts, circuit breakers, idempotency, outbox), observability, and operations — plus distributed system model (ownership planes, network hops), failure modes (retry storms, dual writes, contract skew, trust boundaries), decision trade-offs (monolith vs split, mesh vs gateway, consistency), quality guardrails (no fake ARNs, honest SLO/mesh claims).

  Use this skill when designing or reviewing microservices architecture, decomposition, data ownership, integration patterns, and production operations.

  Combine with **`api-design-pro`**, **`performance-tuning-pro`**, **`deployment-pro`**, **`security-pro`**, **`network-infra-pro`**, **`postgresql-pro`**, **`testing-pro`**, **`ci-cd-pro`**, **`nestjs-pro`**, and other stack skills as needed.

  Triggers: "microservices", "service boundary", "bounded context", "distributed system", "CAP", "eventual consistency", "saga", "choreography", "orchestration", "event-driven", "outbox", "idempotency", "service mesh", "Istio", "Linkerd", "api gateway", "Kong", "resilience", "circuit breaker", "bulkhead", "retry storm", "observability", "distributed tracing", "correlation id", "split brain", "backpressure", "edge case".

metadata:
  short-description: Microservices — distributed model, boundaries, resilience, failure modes, operations
  content-language: en
  domain: microservices
  level: professional
---

# Microservices (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use [Martin Fowler on microservices](https://martinfowler.com/microservices/), DDD references, and [CNCF](https://www.cncf.io/) for conceptual grounding; this skill encodes **boundary-first** design, **resilient** interaction, and **operable** distributed defaults.

## Boundary

**`microservices-pro`** owns **service topology**, **integration style** (sync/async), **resilience patterns**, and **operational** implications. **`deployment-pro`** owns **ship path** mechanics; **`api-design-pro`** owns **contract** format details; **`security-pro`** owns **threat model** depth; **`network-infra-pro`** owns **VPC/LB/TLS** infrastructure.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`api-design-pro`** | Contracts, versioning, errors |
| **`performance-tuning-pro`** | Tail latency in multi-hop chains |
| **`deployment-pro`** | Canary, multi-env promotion |
| **`network-infra-pro`** | Ingress, mTLS, zoning |
| **`postgresql-pro`** | DB-per-service, replication, RLS |
| **`nestjs-pro`** | Node service implementation patterns |
| **`security-pro`** | Identity, mesh policy, abuse |
| **`testing-pro`** | Contract / CDC tests |
| **`ci-cd-pro`** | Multi-service pipelines |

## When to use

- Decomposition, bounded contexts, ownership.
- Sync vs messaging, saga/choreography.
- Resilience, timeouts, duplication/reorder handling.
- Observability and operational readiness.

## When not to use

- **Single-process** profiling only — **`performance-tuning-pro`** alone may suffice.
- **Pure CI YAML** syntax — **`ci-cd-pro`**.

## Required inputs

- **Team topology**, **traffic/SLO**, **platform** (K8s, VMs, serverless mix).
- **Consistency** expectations (strong vs eventual) per use case.

## Expected output

Follow **Suggested response format** strictly.

## Workflow

1. Confirm platform, messaging stack, data stores, SLO.
2. Apply summaries; open `references/`; defer contract syntax to **`api-design-pro`** when dominated.
3. Respond with **Suggested response format**; failure modes explicit for sync chains and events.

### Operating principles

1. **Boundaries follow domain ownership** — **`distributed-services-system-model.md`**.
2. **Shorten synchronous chains** — Tail latency — **`tips-and-tricks.md`**.
3. **Partial failure explicit** — Timeouts, breakers — **`failure-modes-detection-mitigation.md`**.
4. **Eventual consistency by design** — UX semantics — **`edge-cases.md`**.
5. **Observable by default** — Trace propagation — **`tips-and-tricks.md`**.

### Distributed services system model (summary)

Ownership planes, sync vs async, observability spine — **`distributed-services-system-model.md`**.

Details: [references/distributed-services-system-model.md](references/distributed-services-system-model.md)

### Failure modes — detection and mitigation (summary)

Retry storms, dual writes, skew, zero-trust gaps — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Monolith vs split, sync vs async cost, mesh vs gateway, Conway — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

No fabricated infra IDs; mesh claims qualified — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Microservices tips and tricks (summary)

Bounded contexts, outbox, platform standards — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Coupling, cascades, data, skew, org — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Anti-patterns (summary)

Distributed monolith, chatty sync — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Decision trees (summary)

Split, sync/async, data, mesh — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Integration map (summary)

Cross-skill routing — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions and compatibility (summary)

Contracts, runtime skew, platform pins — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Scale, teams, platform, SLO, traffic profile.
2. **Problem / goal** — Greenfield split, incident postmortem pattern, gateway trust issue.
3. **System design** — Ownership and interaction topology — **`distributed-services-system-model.md`**.
4. **Decision reasoning** — Sync vs async; split vs monolith; mesh — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Contracts/events checklist, resilience controls — **`quality-validation-and-guardrails.md`** (no fake resource names).
6. **Trade-offs** — Operational load vs autonomy; consistency vs UX.
7. **Failure modes** — Cascades, skew, trust — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Migration, on-call; **`deployment-pro`**, **`security-pro`**, **`api-design-pro`** handoffs.

## Resources in this skill

| Topic | File |
|-------|------|
| **Distributed services model** | [references/distributed-services-system-model.md](references/distributed-services-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Migrate monolith to microservices safely.  
**Expected output:** Full **Suggested response format** — bounded contexts, strangler, contracts, resilience — **`tips-and-tricks.md`**.

### 2 — Tricky (edge case)

**Input:** Two teams write same `orders` table with different paths.  
**Expected output:** Single writer / saga — **`anti-patterns.md`**; **failure modes** dual write — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** Gateway adds auth but services trust internal headers.  
**Expected output:** **`security-pro`** zero-trust — **`microservices-pro`** mTLS/token validation each hop — **`api-design-pro`** contract.

## Checklist before calling the skill done

### Architecture

- [ ] **Boundaries** domain-driven; ownership explicit — **`distributed-services-system-model.md`**.
- [ ] **Sync/async** model and failure handling defined — **`decision-tree.md`**.

### Reliability

- [ ] **Consistency** and **idempotency** addressed for events/retries — **`edge-cases.md`**.
- [ ] **Timeouts / circuit breakers** for sync paths — **`failure-modes-detection-mitigation.md`**.
- [ ] **Failure modes** section present for production-relevant designs.

### Deliverable

- [ ] Concrete contract/topology/checklist — **`quality-validation-and-guardrails.md`**.
- [ ] **Residual risks**: rollout, skew — **`versions.md`**; **`deployment-pro`** when ship dominates.
