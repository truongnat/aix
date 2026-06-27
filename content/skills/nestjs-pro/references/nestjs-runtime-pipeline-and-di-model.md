# NestJS runtime pipeline and DI model

## HTTP request pipeline (mental map)

```text
Middleware → Guards → Interceptors (before) → Pipes → Controller handler
    → Interceptors (after) → Exception filters
```

**Order matters** — authZ belongs in **Guards** before business logic executes — **`decision-tree.md`**.

## Dependency injection scopes

| Scope | Fits | Risk |
|-------|------|------|
| **Singleton** | Stateless services | Default |
| **Request** | Per-request tenant/db context | Memory + perf — **`anti-patterns.md`** |
| **Transient** | Rare; new instance each injection | Cost |

## Module graph

- **Dynamic modules** (`register`, `registerAsync`) — async factory for `ConfigModule`, DB — **`tips-and-tricks.md`**.
- **Circular deps** — `forwardRef()` last resort; prefer boundary redraw — **`edge-cases.md`**.

## Lifecycles

- **`OnModuleInit` / `enableShutdownHooks`** — DB, queues, Redis close **before** process exit — **`edge-cases.md`**.
