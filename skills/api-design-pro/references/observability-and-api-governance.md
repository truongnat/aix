# Observability and API governance

Contracts for **operations** and **client support**, without leaking secrets.

## Request correlation

- **`requestId`** / **`traceparent`** (W3C) — propagate across services.
- Error envelope includes **same id** user can quote to support.

## Error code taxonomy

- Stable **`code`** enum per API product (`INVALID_CURSOR`, `RATE_LIMITED`) — govern additions in OpenAPI.

## Audit

- Sensitive mutations emit **audit events** (who, what resource id, outcome) — shape agreed with compliance.

## Client-debuggable metadata

- Optional **`instance`** URI (RFC 7807 problem+json) — **no** stack traces in production public APIs.

## Monitoring signals

- Track **version** header usage, **deprecated** endpoint traffic, **idempotency collision** rate, **429** ratio.

## Deprecation governance

- **Sunset** dates; **Link** headers; dashboard on remaining callers — **`versions.md`**.

## Review checklist

- [ ] Logs/metrics redact **PII** and secrets — pair **`security-pro`**.
- [ ] Breaking response changes require **version** or **additive** migration path.
