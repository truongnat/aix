# Performance investigation — {{subject}}

> **Date:** {{date}}  **Author:** {{author}}  **Environment:** {{env}}  
> **Status:** Draft | Final

## Executive summary

<!-- 3–5 sentences: symptom, suspected bottleneck, confidence, next step -->

## Scope and baseline

| Metric | Baseline | Current | Target |
|--------|----------|---------|--------|
| p95 latency | | | |
| Throughput | | | |
| Error rate | | | |

## Reproduction

- **Steps:**
- **Tools:** (profiler, APM trace id, `curl`, load script)
- **Data volume:**

## Findings

### 🔴 Critical — regressions / SLO breach

<!-- Location, evidence (flame graph, query plan), impact -->

### 🟡 Important — hot paths

### 🟢 Minor — optimizations

## Root cause

<!-- Single primary cause when possible; supporting factors -->

## Recommendations

1. **Immediate** — …
2. **Next sprint** — …

## Verification

- [ ] Repro script passes with improvement ≥ {{threshold}}%
- [ ] No new errors in logs / dashboards

## Related

- Workflow: [`workflows/dev/perf-investigation.md`](../../workflows/dev/perf-investigation.md)
- Conventions: [`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)
