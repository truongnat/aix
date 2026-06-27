# Decision tree — clean code / architecture

## Where does this logic belong?

```
Pure domain rule (no I/O)?
└── Domain/core module — no framework imports

Touches HTTP, DB, UI?
└── Adapter / infrastructure layer — thin; core stays framework-agnostic

Shared across features?
├── True domain concept → shared domain module
└── Accidental duplication → extract after second use (rule of three)
```

## Refactor now vs later?

```
Tests green and behavior clear?
├── Yes → small steps: extract function → rename → move file
└── No → stabilize characterization tests first (`testing-pro`)

Big-bang rewrite?
└── Avoid; prefer strangler / incremental boundary moves — bounded-context-and-strangler-patterns.md
```

## Dependency direction

```
Inner layer importing outer (e.g. domain importing Nest module)?
└── Invert: use interface/port in core; implement in outer shell
```

## Strict Clean Architecture vs pragmatic layering

```
Domain rules complex (pricing, compliance, multi-step workflows)?
├── Invest in explicit domain + use cases early — decision-framework-and-tradeoffs.md
└── Simple CRUD with stable schema?
    └── Minimal layers + lint to prevent inward leaks; avoid ceremony
```

## Monolith vs multiple deployables

```
Multiple teams stepping on same DB tables?
├── Clarify bounded context first — modular monolith often beats premature split
└── Independent release cadence required?
    └── Extract service only when boundary + ops justified — integration-map skills
```

## Sync vs event-driven boundaries

```
Need strong consistency across aggregates in one request?
└── Single use case / transaction boundary

Cross-context eventual consistency acceptable?
└── Domain events + explicit handlers — watch ordering and duplicates
```

## Further reading

- [dependency-rule-system-model.md](dependency-rule-system-model.md), [failure-modes-detection-mitigation.md](failure-modes-detection-mitigation.md)
