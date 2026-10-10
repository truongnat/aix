# NestJS — decision trees

Use these when choosing **where code runs** in the request lifecycle or **how to structure modules**.

## Guard vs Middleware vs Interceptor vs Pipe vs Filter

```
Need to run logic on the request path?
├── Before route handler, must block unauthorized users?
│   └── Guard — authz checks, roles, policies (can throw ForbiddenException)
├── Before Nest sees the route (e.g. raw body, CORS, logging every hit)?
│   └── Middleware — Express layer; no DI of Nest providers unless bridged
├── Wrap handler execution (timing, logging, map response shape)?
│   └── Interceptor — RxJS stream; good for metrics and response transforms
├── Transform/validate input or output types?
│   └── Pipe — validation, parsing, defaults (ValidationPipe at boundary)
└── Map thrown errors to HTTP responses consistently?
    └── ExceptionFilter — domain errors → status + body shape
```

**Decision:** Prefer **Guards** for authorization (runs after auth identity is known). Use **Middleware** only when you need the raw Node/Express pipeline or order before guards.

## Dynamic module vs static registration

```
Registering a reusable library (config, DB, queue)?
├── Options differ per consumer (imports, secrets)?
│   └── DynamicModule with register/registerAsync
└── Single global config for whole app?
    └── Static imports in AppModule or CoreModule
```

## Request-scoped provider vs default singleton

```
Provider needs current request (tenant id, user, CLS)?
├── Yes, and one instance per HTTP request?
│   └── Scope.REQUEST (understand memory: avoid huge graphs)
└── Stateless service?
    └── Default singleton
```

## Microservice transport vs HTTP in same codebase

```
Exposing the same domain to HTTP and a message broker?
├── Shared domain services in feature modules; separate controllers/transports
└── Avoid duplicating business rules in @MessagePattern and @Get handlers — delegate to the same service
```

## Fastify vs Express adapter

```
Performance and schema validation on HTTP layer matter most?
├── Fastify — often lower overhead; plugin ecosystem differs
└── Express — widest middleware compatibility — verify Nest docs for your major
```

See pipeline ordering — **`nestjs-runtime-pipeline-and-di-model.md`**.

## Further reading

- Cross-cutting order: [tips-and-tricks.md](tips-and-tricks.md)
- Failure modes: [edge-cases.md](edge-cases.md)
