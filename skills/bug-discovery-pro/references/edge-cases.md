# Bug discovery edge cases

## Stale graph

- Index from **yesterday** + **large refactor** today → **`impact`** may be wrong; **re-index** or verify manually.

## Name collisions

- **`context`** on a common name — **disambiguate** with `file_path` or `uid` from prior results.

## Dynamic code

- **Reflection**, stringly `require()`, **eval** — graph may be **incomplete**; not a GitNexus bug.

## Monorepos

- **Wrong `repo`** — Cross-package bugs need correct **repo** parameter or `list_repos`.

## False positives from shape_check

- **Consumer** fetches **multiple** routes — attribution may be **approximate**; read consumer code.

## “Found nothing”

- Symptom in **native** code, **browser** only, or **infra** — graph may not cover; expand scope.

## Security

- Do not paste **secrets** into queries; use **redacted** logs.

---

## Runtime bugs

- **Memory leak** only after **hours** — need heap comparison or long-running repro.
- **CPU spike** from **infinite retry** — trace shows tight loop or retry storm metrics.
- **GC pause** causes **timeout** — correlate pause logs with SLA breaches.
- **File descriptor leak** — “too many open files” after sustained traffic.

## Concurrency bugs

- **Race** on DB row without version — intermittent wrong counts.
- **Duplicate job execution** — scheduler + worker overlap; idempotency gap.
- **Lock starvation** — low priority never acquires.
- **Async retry overlap** — two in-flight mutates same entity.

## Distributed bugs

- **A succeeds, B fails** — partial saga; missing compensation visibility.
- **Eventual consistency delay** — user reads stale immediately after write.
- **Message queue duplicate** — handler not idempotent.
- **Webhook out-of-order** — state machine assumes serial delivery.

## Infra / config bugs

- **Config drift** between envs — same code, different URL or pool size.
- **Feature flag mismatch** — cohort sees half-old behavior.
- **Stale cache** — CDN or app cache after deploy.
- **DNS / network** — intermittent resolution or regional routing.

## Observability bugs

- **Log missing context** — cannot correlate user or trace.
- **Trace broken** — missing propagation header → wrong blame.
- **Metrics don’t align** — definition or aggregation bug; false “green”.
- **Alert false positive** — threshold or query wrong; wastes triage.
