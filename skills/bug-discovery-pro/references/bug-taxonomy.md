# Bug taxonomy

Classify defects to pick **investigation tactics** — graph-heavy vs runtime-heavy vs infra-heavy.

## Types

| Type | Signals | Typical tools |
|------|---------|----------------|
| **Logic** | Wrong branch, off-by-one, incorrect formula | Tests, code review, **`query`** / **`context`** |
| **State** | Stale UI, inconsistent entity state, bad transitions | Trace state flow, **`workflow`** domain skills |
| **Concurrency** | Rare failures, ordering, duplicates | Threads/async traces — **`state-and-concurrency-debugging.md`** |
| **Data inconsistency** | Partial writes, orphan rows, drift across stores | DB queries, reconciliation jobs, **`api-design-pro`** contracts |
| **Integration** | Third-party timeouts, schema mismatch at boundary | Logs, **`shape_check`**, consumer **`api_impact`** |
| **Config** | Works in staging only, wrong endpoint | Env diff, feature flags — **`failure-modes.md`** |
| **Infra** | DNS, LB, disk, network partitions | Metrics, infra dashboards — **`distributed-systems-debugging.md`** |
| **Performance** | Latency, CPU, memory growth | Profiles, traces — **`runtime-debugging.md`** |
| **Security** | AuthZ bypass, injection | **`security-pro`** — not proven by graph alone |

## Layering

One symptom can map to **multiple** types (e.g. **integration** + **config**). Track **primary** vs **contributing**.

## Review checklist

- [ ] Taxonomy label assigned where it changes the next investigation step.
