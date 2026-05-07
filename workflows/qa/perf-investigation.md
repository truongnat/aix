# Workflow: perf-investigation

Repeatable **performance investigation**: baseline → reproduce → profile → hypothesis → fix → verify. Works for latency, throughput, memory, and DB-bound regressions.

**Domain:** `dev` — **`workflows/dev/`**. **Filename:** `perf-investigation.md`.

**Invoke:** `/perf-investigation`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `perf-investigation` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `symptom` | Yes | What degraded (p95, CPU, memory, DB time, …) |
| `baseline` | No | Known good numbers or date |
| `domain_stack` | No | Runtime, framework, DB |

## Outputs

| Variable | Description |
|----------|-------------|
| `perf_report` | Metrics, findings, ranked recommendations |
| `root_cause` | Confirmed bottleneck with evidence |
| `verification` | How to prove the fix |

## Decision paths

- **No baseline:** Establish baseline first (Step 2); label comparisons **approximate**.
- **Prod-only:** Use traces/metrics; avoid destructive experiments in prod.
- **Suspected infra:** After Step 3, if evidence points to network/host → escalate; do not guess kernel tuning.

## Error handling

- **Noisy metrics:** Narrow time window; correlate with deploys; use percentiles not averages alone.
- **Cannot reproduce:** Treat as intermittent — follow `w-debug` instrumentation patterns.

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)**.  
Final artifact MUST align with **[`templates/report/performance-report.md`](../../templates/report/performance-report.md)**.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Single hot function | < 2 h |
| **Standard** | App + DB + cache | 1 day |
| **Deep** | Distributed / GC / kernel | > 3 days |

## Escalation

- **Human:** Capacity planning, hardware spend, SLO breach comms.
- **Autonomous:** Profiling, query plans, code-level fixes, load-test scripts.

## Steps

### Step 1 — `define-slo-and-scope`

- **Type:** skill
- **Skill:** `planning-pro`
- **Input:** `symptom`, `baseline`
- **Output:** Metric + target + **in scope** components.

### Step 2 — `measure-and-reproduce`

- **Type:** skill
- **Skill:** `bug-discovery-pro` + `performance-tuning-pro`
- **Input:** Repro steps, load pattern
- **Output:** Repeatable measurement + **before** numbers.

### Step 3 — `profile-and-trace`

- **Type:** skill
- **Skill:** `performance-tuning-pro` (+ `postgresql-pro` for DB, `caching-pro` for cache)
- **Input:** Hot path candidates
- **Output:** Flame graph / trace / query plan highlights.

### Step 4 — `hypothesize-and-fix`

- **Type:** skill
- **Skill:** Domain `*-pro` + `performance-tuning-pro`
- **Input:** Evidence from Step 3
- **Output:** Minimal change + **expected** impact.

### Step 5 — `verify-and-report`

- **Type:** skill
- **Skill:** `testing-pro` + `feedback-pro`
- **Input:** Fix + repro from Step 2
- **Output:** `perf_report`, `root_cause`, `verification` using performance report template.

## Notes

- Pair with **`prompts/debugging/performance-profiling.md`** when the user starts from a vague “slow” report.
