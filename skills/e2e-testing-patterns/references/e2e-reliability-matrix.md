# E2E reliability matrix

| Risk | Test/diagnostic | Acceptance evidence |
|---|---|---|
| Shared state | Run isolated and shuffled; reset data per test | Same result independent of order |
| Async race | Replace sleeps with condition-based waits; throttle network | Stable under slow/fast timing |
| Selector drift | Prefer role/label/test-id; review failed locator trace | Locator expresses user-visible contract |
| External dependency | Stub at boundary or use deterministic sandbox | Failure behavior is explicit and reproducible |
| Retry masking | Compare first attempt and retry traces | Retry rate is monitored; flakes are not silently ignored |
| Parallelism | Run workers with isolated accounts/data | No cross-worker contamination |
| Browser/platform | Cover supported browser/device matrix | Failures map to platform expectation |
| Cleanup | Close pages, contexts, listeners, test data | No leaked process/resource between tests |

A green run is insufficient if retries were required; report pass-on-first-attempt rate and known quarantine entries.
