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