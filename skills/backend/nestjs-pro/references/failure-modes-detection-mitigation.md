# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Guard bypass** | Wrong metadata order | Unauthorized access audit | Route-level guard + tests — **`tips-and-tricks.md`** |
| **DTO mass assignment** | No `forbidNonWhitelisted` | Escalation fields (`isAdmin`) | Whitelist + authz — **`anti-patterns.md`** |
| **Leak stack/DB errors** | Raw exception to client | 500 with internals | HttpExceptionFilter — **`api-design-and-dx.md`** |
| **RLS context missing** | SET outside Tx | Cross-tenant read | Tx + `SET LOCAL` — **`postgresql-rls-integration.md`** |
| **PgBouncer + session GUC** | Pool mode mismatch | Silent wrong tenant | Align pool mode — **`postgresql-rls-integration.md`** |
| **Long-held DB Tx** | await external HTTP in Tx | Lock timeouts | Narrow Tx — **`edge-cases.md`** |
| **Duplicate Bull jobs** | Retry without idempotency | Double charge | Job id + dedupe — **`edge-cases.md`** |
| **Circular DI at runtime** | forwardRef abuse | Startup crash | Restructure modules — **`edge-cases.md`** |
| **Shutdown data loss** | No drain | Killed workers | `enableShutdownHooks`, Bull close — **`edge-cases.md`** |
| **Global mutable request state** | Singleton holding userId | Cross-request bleed | ALS/Cls or request scope — **`edge-cases.md`** |
