# Failure modes — detection and mitigation

| Failure | Why it happens | Detect | Mitigate |
|---------|----------------|--------|----------|
| **Domain imports framework** | Shortcut for “one quick fix” | Import/lint rules (ESLint boundaries, ArchUnit, dep-cruiser) | Extract port; move code to adapter |
| **Anemic domain** | CRUD + logic in services only | Fat “service” classes; no invariants on entities | Pull rules into domain; thin orchestration |
| **God module** | Fear of creating files | File length / churn metrics | Split by responsibility; feature slice |
| **Cyclic dependencies** | Mutual feature calls | Cycle detectors in CI | Extract orchestration; domain events; shared kernel only if truly shared |
| **Leaky ORM** | Entities used as API DTOs | API responses expose DB columns | Map at boundary; separate read models if needed |
| **Utils hub** | Unclear ownership | `shared/utils` import fan-in | Rename to domain concept or delete; rule of three |
| **Tests green, architecture broken** | Mocks hide wiring | Manual review; module integration tests | Contract tests on real composition root |
| **Big-bang rewrite** | Desire for purity | Large PR with no characterization tests | Strangler; slice-by-slice — **`bounded-context-and-strangler-patterns.md`** |
| **Distributed ball of mud** | “Microservices” without bounded context | Chatty calls; duplicated models | Modular monolith first or explicit context boundaries |
