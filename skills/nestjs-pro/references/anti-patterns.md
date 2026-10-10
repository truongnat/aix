# NestJS — anti-patterns

Things that look reasonable in Nest but cause **security, performance, or maintenance** problems.

1. **Fat controllers** — HTTP adapters should delegate; business rules in services. Controllers with SQL, complex branching, or domain logic become untestable.

2. **Global `ValidationPipe` without `whitelist`** — Unknown JSON fields slip through and can be mass-assigned into entities or logged.

3. **Guards that throw generic 401 for both “not logged in” and “not allowed”** — Clients cannot fix authz bugs; use 403 with stable error codes for authorization failures.

4. **`Scope.REQUEST` by default** — Request scope multiplies instances; use only where necessary (tenant context, per-request cache).

5. **Circular `forwardRef()` as the first fix** — Often signals wrong module boundaries; refactor modules before permanent `forwardRef` chains.

6. **Leaking stack traces or DB errors in production** — Use `ExceptionFilter` to normalize; map Prisma/TypeORM errors to safe messages.

7. **Starting long I/O inside transactions** — Holds DB connections; keep transactions short; move HTTP calls and file I/O outside unless required.

8. **Assuming RLS is enforced because a Guard ran** — RLS lives in PostgreSQL; session variables must be set in the **same transaction** as queries (`postgresql-rls-integration.md`).

9. **Bull jobs without idempotency keys** — Retries duplicate side effects; design jobs to be safe on duplicate delivery.

10. **Testing only with mocked everything** — Critical paths need at least one e2e or integration test with real HTTP + DB test container.

When NOT to apply a Nest abstraction: one-off scripts and CLI tools may be simpler without `NestFactory` — do not force Nest into every executable.
