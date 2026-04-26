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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** platform, messaging stack, data stores, SLO. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm service boundary intent, team ownership, data stores, and SLOs before proposing distribution. Ask whether a split is solving a real problem or creating one.
2. **Simplicity First** — Prefer the smallest topology that satisfies ownership and scaling needs. Do not split services, add buses, or introduce sagas without clear pressure.
3. **Surgical Changes** — Touch only the relevant service boundary, integration path, or resilience control. Avoid broad distributed-architecture rewrites.
4. **Goal-Driven Execution** — Done = boundaries, contracts, failure handling, and operational implications are explicit and verifiable.
5. **Boundaries beat buzzwords** — Service count matters less than clear ownership, data responsibility, and change isolation.
6. **Network is part of correctness** — Retries, timeouts, duplication, and partial failure are default realities, not edge cases.
7. **Data ownership is a hard rule** — Dual writes and hidden shared-db coupling should be treated as design liabilities.
8. **Operability is part of design** — A service is not “done” if tracing, alerting, and rollout implications are undefined.

## Default recommendations by scenario

- **Considering a split** — Validate bounded context and team ownership first; keep the monolith if pressure is weak.
- **Cross-service workflow** — Decide sync vs async and idempotency behavior before implementation details.
- **Resilience issue** — Fix timeout/retry/backpressure contracts before adding more infrastructure layers.
- **Event-driven design** — Clarify ordering, dedupe, and outbox strategy before praising decoupling.

## Decision trees

Summary: decide whether to stay monolithic, split, message, or orchestrate based on ownership, consistency, latency, and failure tolerance.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: premature service splits, shared databases posing as autonomy, retry storms, and event-driven complexity without ownership clarity.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Distributed services system model (summary)

How ownership planes, network hops, contracts, and state transitions interact in a real microservice system.

Details: [references/distributed-services-system-model.md](references/distributed-services-system-model.md)

### Failure modes and mitigation (summary)

Dual writes, contract skew, partial failure, split brain, retries, and observability gaps to address before scale amplifies them.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

How to choose between monolith vs split, sync vs async, and stronger consistency vs looser coupling.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Versions (summary)

Version notes that affect platform integrations, service-mesh assumptions, and stack compatibility in distributed deployments.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Platform, ownership, traffic/SLO, data stores, and consistency needs.
2. **Distributed model** — Explain the relevant boundary, interaction, and failure-handling logic.
3. **Recommendation** — Minimum topology or resilience change with rationale.
4. **Verification** — How to prove contracts, failure handling, and operability are correct.
5. **Residual risks** — Remaining coupling, latency, or organizational caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Distributed services system model | [references/distributed-services-system-model.md](references/distributed-services-system-model.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Should we split billing out of the monolith?"
- Check ownership, release friction, and consistency needs before assuming a microservice is the answer.
- Prefer the smallest boundary that reduces real pain.
- **Verify:** The recommendation names which coupling pressure justifies the split or why it does not.

**Input (tricky):** "Retries fixed our failures, but now traffic spikes collapse the system."
- Treat retry storms as a design bug, not a resilience success.
- Fix timeout, backpressure, and idempotency contracts before adding more replicas blindly.
- **Verify:** Failure load no longer amplifies through retries under the same scenario.

**Input (cross-skill):** "Design async events between services with DB ownership."
- Pair **`api-design-pro`** for contracts and **`postgresql-pro`** for data-boundary implications.
- Keep ownership and outbox behavior explicit.
- **Verify:** Event flow, dedupe, and data consistency expectations are stated and testable.

## Checklist before calling the skill done

- [ ] Service boundaries, ownership, data stores, and SLOs confirmed first (Think Before Coding)
- [ ] Minimum topology or resilience change chosen; no unnecessary distributed complexity added (Simplicity First)
- [ ] Only the relevant boundary or interaction path was changed (Surgical Changes)
- [ ] Success criteria and failure-handling verification are explicit (Goal-Driven Execution)
- [ ] Data ownership and consistency expectations are stated
- [ ] Retry/timeout/backpressure behavior is addressed where relevant
- [ ] Operability requirements are included
- [ ] Residual organizational or coupling risks are documented
