# Bug discovery — decision tree

## Where to start

- **Deterministic local repro** → Code + tests + bisect; add **`query`** / **`impact`** when graph fresh.
- **Production-only / intermittent** → **Telemetry first** — **`runtime-debugging.md`**, **`observability-integration.md`** — then narrow code with graph.
- **Cross-service** → Traces + **`distributed-systems-debugging.md`**; **`api_impact`** / **`shape_check`** for contract angle.

## Tooling

- **Graph indexed** → `query` → `context` → `impact` / `api_impact`.
- **No graph** → Grep + tests + bisect; honest limits.

## Symptom

- **Intermittent** → Repro harness; logging correlation; **concurrency** hypothesis — **`state-and-concurrency-debugging.md`**.
- **Shape/API** → `shape_check` + consumer search if available.
- **After deploy / flag** → **Config** and **failure modes** — **`failure-modes.md`**.

## Taxonomy hint

- **Wrong output, stable** → **Logic** / **state** bug path.
- **Flaky** → **Concurrency**, **timing**, **infra**.
- **Slow / OOM** → **Performance** — profile — **`runtime-debugging.md`**.

## Security-sensitive

- **Abuse class** → **`security-pro`**; graph is not pen-test.
