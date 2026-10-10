# Expo data-fetching test matrix

Use this reference when the implementation includes fetch, React Query, SWR, loaders, auth, caching, or offline behavior. Prefer mocked transport and deterministic clocks for unit tests; reserve device/network tests for platform behavior.

## State matrix

| Scenario | Expected result |
|---|---|
| 2xx valid response | Data is parsed, cached with the intended key, and rendered |
| 4xx validation/auth error | Typed error is shown; no unsafe retry loop |
| 5xx/transient error | Bounded retry/backoff; final error state is actionable |
| Timeout/network loss | Request ends in network error; cancellation/cleanup occurs |
| Malformed JSON/schema | Parse/contract error is surfaced; invalid data is not cached |
| Offline launch | Cached data or explicit offline state appears; no secret leakage |
| Request cancellation | Unmounted screen does not update state or show stale error |
| Concurrent token refresh | One refresh operation; waiting requests share the result |
| Cache invalidation after mutation | Relevant queries refresh once with the right key |
| Environment misconfiguration | Missing/unsafe URL fails early; secrets are not in client variables |

## Evidence

Record query key, fixture, network response, cache state, rendered state, retry count, and cleanup behavior. For auth flows, test expired token, refresh failure, logout during refresh, and unauthorized response after refresh.

## Verification packet examples

| Case | Claim and criteria | Evidence required | Status rule |
|---|---|---|---|
| Valid response/cache | Data parses, uses the intended key, renders, and contains no client secret | Mocked response, query-key assertion, rendered-state assertion, bundle/env inspection | `pass` only when every criterion is mapped |
| Invalid schema/cache safety | Invalid payload is rejected and never cached | Parse error plus cache inspection | `block` if invalid data enters cache |
| Offline/device behavior | Offline cache, cancellation, refresh concurrency, and logout are safe | Unit fixtures plus fresh device/network evidence | `defer` when device/network evidence is unavailable |

Pass the packet fields `Claim`, `Criteria`, `Evidence`, `Coverage map`, `Limitations`, `Decision`, and `Next owner` to `sk-verify-pro`.
