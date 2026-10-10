# Anti-patterns — testing-pro

1. **Asserting implementation details** — Tests break on refactor; assert user-visible outcomes.
2. **E2E for everything** — Slow, flaky; push logic down to unit/integration.
3. **Real `setTimeout` in tests** — Use fake timers or proper awaits.
4. **Shared mutable state between tests** — Order-dependent failures.
5. **Snapshot soup** — Giant snapshots that nobody reads; use targeted snapshots.
6. **Mocking the system under test** — Mocks should sit at boundaries, not inside core logic without reason.
7. **No failure artifacts in CI** — Always retain screenshots/traces/logs on failure.

See [test-pyramid-and-strategy.md](test-pyramid-and-strategy.md) and [edge-cases.md](edge-cases.md).
