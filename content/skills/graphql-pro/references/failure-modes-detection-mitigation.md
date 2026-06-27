# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **N+1** | Per-row resolver DB hits | Trace spans; DataLoader metrics | Batch/cache — **`tips-and-tricks.md`** |
| **Non-null violation** | Resolver throws / null for `!` | Error path; partial `null` parents | Fix resolver; relax type only with migration — **`edge-cases.md`** |
| **Query DoS** | Deep tree / aliases | CPU spike; timeouts | Depth/complexity limits; persisted ops — **`decision-tree.md`** |
| **Field-level authZ leak** | Root OK, nested field exposes PII | Pentest; logs | Per-field guards — **`edge-cases.md`** |
| **Introspection exposure** | Schema discovery | Public prod Playground | Env gate — **`security-pro`** |
| **Federation skew** | Gateway/subgraph version mismatch | Compose errors; runtime oddities | Pin router/subgraph versions — **`edge-cases.md`** |
| **Subscription overload** | Fan-out events | Broker lag | Filter + backpressure — **`edge-cases.md`** |
| **Breaking nullability** | Stricter `!` | Client crashes | Deprecate + staged rollout — **`edge-cases.md`** |
| **Leaky errors** | Stack traces in `extensions` | Info disclosure | Sanitize prod errors — **`anti-patterns.md`** |
| **Mutation double-submit** | Retries | Duplicate rows | Idempotency keys — **`decision-tree.md`** |
