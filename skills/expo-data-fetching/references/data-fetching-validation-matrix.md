# Expo data-fetching state and verification matrix

Use this matrix after the compact workflow when the task involves a high-risk claim. Fixtures must use synthetic identifiers and redacted values. The domain skill produces evidence; `sk-tester` executes tests, `sk-review`/`sk-review-pr` records findings, and `sk-verify-pro` owns the final `pass`/`block`/`defer` decision.

| Scenario | Expected result | Evidence | Failure/limitation | Next owner |
|---|---|---|---|---|
| HTTP error | A 500 response renders a retryable error state and preserves safe request context. | Test log, rendered state assertion, redacted request ID. | No silent fallback to stale data. | sk-tester -> sk-verify-pro |
| Malformed payload | Schema parsing rejects missing required fields and exposes a typed UI error. | Fixture payload, parser result, UI assertion. | Never persist unvalidated payloads. | sk-review -> sk-verify-pro |
| Timeout | A bounded timeout cancels the request and offers retry without duplicate mutation. | Fake-timer result, cancellation signal, retry count. | Unbounded waits block release. | sk-tester -> sk-verify-pro |
| Offline queue | A safe mutation queues offline, shows pending status, and replays once after reconnect. | Queue snapshot, replay key, network transition log. | Conflict policy must be explicit before replay. | sk-expo-data-fetching -> sk-review |
| Cancellation | Leaving the screen aborts the request and prevents state updates on an unmounted owner. | Abort signal assertion and no-update-after-unmount test. | Do not treat cancellation as a user-visible failure. | sk-tester -> sk-verify-pro |
| Token refresh concurrency | Concurrent 401s share one refresh promise; only the original requests retry once. | Concurrency fixture, refresh count=1, retry trace. | Refresh token values are never logged. | sk-api-security-pro -> sk-verify-pro |
| Cache invalidation | A successful write invalidates only affected keys and refetches the canonical record. | Cache key trace, before/after data assertion. | Broad cache clears require measured justification. | sk-review -> sk-verify-pro |
| Environment leakage | Development endpoints and test credentials are absent from production bundle/config. | Build-time config scan and bundle assertion. | A local green test cannot prove production secrecy. | sk-security-review -> sk-verify-pro |

## Verification response shape

Return exactly:

- **Claim:** the bounded domain claim being assessed.
- **Criteria:** scenario rows and acceptance thresholds.
- **Evidence:** paths, commands, fixture IDs, timestamps and reviewer findings.
- **Limitations:** untested environments, assumptions, stale inputs or residual risk.
- **Next owner:** `sk-tester`, `sk-review`, `sk-review-pr`, the named domain owner, or `sk-verify-pro`.

Do not claim final release status from this matrix; hand the packet to `sk-verify-pro`.
