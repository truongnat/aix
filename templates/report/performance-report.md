# Performance Investigation — {{subject}}

> **Date:** {{date}}  
> **Author:** {{author}}  
> **Environment:** {{env}} ({{region}})  
> **Status:** Draft | In Progress | Final  
> **Priority:** P0 / P1 / P2 / P3

---

## Executive Summary

<!-- 3-5 sentences: symptom, suspected bottleneck, confidence level, business impact, recommended next steps -->

**Performance Degradation:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low  
**Business Impact:** Critical | High | Medium | Low  
**Confidence in Root Cause:** High | Medium | Low

---

## Performance Metrics

### Baseline vs Current

| Metric | Baseline | Current | Delta | Target | Status |
|--------|----------|---------|-------|--------|--------|
| p50 latency | {{value}} | {{value}} | {{percent}}% | {{value}} | ✅ / ⚠️ / ❌ |
| p95 latency | {{value}} | {{value}} | {{percent}}% | {{value}} | ✅ / ⚠️ / ❌ |
| p99 latency | {{value}} | {{value}} | {{percent}}% | {{value}} | ✅ / ⚠️ / ❌ |
| Throughput (RPS) | {{value}} | {{value}} | {{percent}}% | {{value}} | ✅ / ⚠️ / ❌ |
| Error rate | {{value}} | {{value}} | {{percent}}% | {{value}} | ✅ / ⚠️ / ❌ |
| CPU utilization | {{value}} | {{value}} | {{percent}}% | {{value}} | ✅ / ⚠️ / ❌ |
| Memory utilization | {{value}} | {{value}} | {{percent}}% | {{value}} | ✅ / ⚠️ / ❌ |
| Database connections | {{value}} | {{value}} | {{percent}}% | {{value}} | ✅ / ⚠️ / ❌ |

### SLO Compliance

| SLO | Target | Current | Status | Breach Duration |
|-----|--------|---------|--------|-----------------|
| Latency SLO | {{value}} | {{value}} | ✅ / ❌ | {{duration}} |
| Error Budget | {{value}} | {{value}} | ✅ / ❌ | {{duration}} |
| Availability | {{value}} | {{value}} | ✅ / ❌ | {{duration}} |

---

## Investigation Scope

**Affected Components:**
- [ ] API Gateway
- [ ] Application Server
- [ ] Database
- [ ] Cache (Redis/Memcached)
- [ ] CDN
- [ ] Third-party services
- [ ] Other: {{specify}}

**Time Window:** {{start_time}} to {{end_time}} ({{duration}})

**Traffic Volume:** {{requests}} requests ({{percent}}% of normal)

---

## Reproduction Steps

### Steps to Reproduce
1. {{step_1}}
2. {{step_2}}
3. {{step_3}}

### Test Environment
- **Environment:** {{env}}
- **Region:** {{region}}
- **Load test script:** {{path}}
- **Test data:** {{volume}} records

### Tools Used
- **Profiler:** {{tool}} ({{version}})
- **APM:** {{tool}} ({{trace_id}})
- **Load testing:** {{tool}} ({{version}})
- **Monitoring:** {{tool}} ({{dashboard_link}})
- **Database analysis:** {{tool}} ({{query_plan_link}})

---

## Findings

### 🔴 Critical — Regressions / SLO Breaches

#### Finding 1: {{title}}

- **Component:** {{component}}
- **Evidence:** Flame graph, trace, or metrics link
- **Impact:** {{business_impact}}
- **Regression introduced:** {{commit_or_deploy}}
- **Confidence:** High / Medium / Low

**Details:**
Detailed analysis with code snippets, query plans, or resource profiles

---

### 🟡 Important — Hot Paths

#### Finding 2: {{title}}

- **Component:** {{component}}
- **Evidence:** Profile data
- **Impact:** {{performance_impact}}
- **Optimization potential:** {{improvement_estimate}}

**Details:**
...

---

### 🟢 Minor — Optimizations

#### Finding 3: {{title}}

- **Component:** {{component}}
- **Evidence:** Profile data
- **Impact:** {{performance_impact}}
- **Effort to implement:** {{hours}} hours

**Details:**
...

---

## Root Cause Analysis

### Primary Root Cause

**Confidence:** High / Medium / Low

**Description:**
Detailed explanation of the primary cause

**Contributing Factors:**
1. {{factor_1}}
2. {{factor_2}}
3. {{factor_3}}

**Evidence:**
- Logs: {{link}}
- Metrics: {{link}}
- Traces: {{link}}
- Code: {{commit_link}}

### Alternative Hypotheses Considered

| Hypothesis | Status | Evidence | Why Rejected |
|------------|--------|----------|--------------|
| {{hypothesis_1}} | Rejected / Confirmed | {{evidence}} | {{reason}} |
| {{hypothesis_2}} | Rejected / Confirmed | {{evidence}} | {{reason}} |
| {{hypothesis_3}} | Rejected / Confirmed | {{evidence}} | {{reason}} |

---

## Recommendations

### Immediate Actions (within 24-48 hours)
1. **Action:** {{action}}
   - **Owner:** {{person}}
   - **Estimated effort:** {{hours}} hours
   - **Expected improvement:** {{percent}}%
   - **Risk:** Low / Medium / High

2. **Action:** {{action}}
   - **Owner:** {{person}}
   - **Estimated effort:** {{hours}} hours
   - **Expected improvement:** {{percent}}%
   - **Risk:** Low / Medium / High

### Short-term (within 1-2 weeks)
1. **Action:** {{action}}
   - **Owner:** {{person}}
   - **Estimated effort:** {{hours}} hours
   - **Expected improvement:** {{percent}}%

### Long-term (within 1-3 months)
1. **Action:** {{action}}
   - **Owner:** {{person}}
   - **Estimated effort:** {{hours}} hours
   - **Expected improvement:** {{percent}}%

### Infrastructure Changes
- **Scaling:** {{recommendation}}
- **Configuration:** {{recommendation}}
- **Architecture:** {{recommendation}}

---

## Verification Plan

### Performance Tests
- [ ] Load test passes with improvement ≥ {{threshold}}%
- [ ] p95 latency meets SLO
- [ ] Error rate within acceptable range
- [ ] No new errors in logs
- [ ] Resource utilization within limits

### Monitoring
- [ ] Alert thresholds updated
- [ ] Dashboards reflect improvements
- [ ] SLO tracking updated
- [ ] Regression guards in place

### Rollback Plan
- **Trigger conditions:** {{conditions}}
- **Rollback steps:** {{steps}}
- **Rollback time:** {{duration}}

---

## Residual Risks

1. {{risk_1}} - Mitigation: {{mitigation}}
2. {{risk_2}} - Mitigation: {{mitigation}}
3. {{risk_3}} - Mitigation: {{mitigation}}

---

## Lessons Learned

### What Went Well
1. {{lesson_1}}
2. {{lesson_2}}

### What Could Be Improved
1. {{lesson_1}}
2. {{lesson_2}}

### Process Improvements
1. {{improvement_1}}
2. {{improvement_2}}

---

## Appendix

### Performance Profiles
- **CPU profile:** {{link}}
- **Memory profile:** {{link}}
- **Heap snapshot:** {{link}}
- **Flame graph:** {{link}}
- **Trace ID:** {{id}}

### Database Analysis
- **Slow queries:** {{link}}
- **Query plans:** {{link}}
- **Index usage:** {{link}}

### Related Links
- Incident: {{incident_id}}
- PR: {{pr_number}}
- Deploy: {{deploy_id}}
- Discussion: {{link}}

---

## Related

- Workflow: [`workflows/dev/perf-investigation.md`](../../workflows/dev/perf-investigation.md)
- Conventions: [`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)

