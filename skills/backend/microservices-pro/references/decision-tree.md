# Decision tree — microservices

## Monolith vs split

```
Single team, unclear boundaries?
└── Stay modular monolith until ownership and deploy pain justify split

Independent deploy per bounded context + separate SLO?
└── Candidate service — still validate data ownership and sync/async model
```

## Sync vs async between services

```
Caller needs immediate answer for UX?
├── Yes → sync call with strict timeout + circuit breaker
└── No → event/message with idempotency + outbox/inbox

Long-running saga?
└── Choreography or orchestration — document compensation
```

## Data ownership

```
Two services writing same table?
└── Anti-pattern — pick one owner; others use API or events

Shared read model?
└── OK if read-only and rebuild path is defined (CQRS-style)
```

## Service mesh?

```
Cross-cutting mTLS + L7 retries needed at platform scale?
├── Yes → Evaluate mesh complexity vs ingress + library resilience — **`decision-framework-and-trade-offs.md`**
└── Small fleet → Often YARP/gateway + lib patterns suffice
```
