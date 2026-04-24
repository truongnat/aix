# Debug Report — {{subject}}

> **Date:** {{date}}  
> **Author:** {{author}}  
> **Reviewer:** {{reviewer}}  
> **Status:** Open | In Progress | Resolved | Closed  
> **Priority:** P0 / P1 / P2 / P3  
> **Environment:** {{env}} ({{region}})

---

## Executive Summary

<!-- 2-3 sentences: symptom, suspected cause, current state, resolution status -->

---

## Problem Description

### Symptom
{{Detailed description of the observed issue}}

### Environment
- **Application:** {{app_name}} v{{version}}
- **Environment:** {{env}} ({{region}})
- **Component:** {{component}}
- **First observed:** {{date}}
- **Frequency:** Always / Sometimes / Rare
- **Impact:** Critical / High / Medium / Low

---

## Reproduction

### Steps to Reproduce
1. {{step_1}}
2. {{step_2}}
3. {{step_3}}

### Test Conditions
- **Test data:** {{data}}
- **User account:** {{account_type}}
- **Configuration:** {{config}}
- **Prerequisites:** {{prerequisites}}

### Expected vs Actual
| Aspect | Expected | Actual |
|--------|----------|--------|
| Behavior | {{expected}} | {{actual}} |
| Output | {{expected}} | {{actual}} |
| Performance | {{expected}} | {{actual}} |

---

## Evidence

### Logs
- **Application logs:** {{log_link}} (redacted, no secrets)
- **Error logs:** {{log_link}} (redacted)
- **System logs:** {{log_link}} (redacted)
- **Access logs:** {{log_link}} (redacted)

### Traces
- **Trace ID:** {{trace_id}}
- **APM link:** {{apm_link}}
- **Distributed trace:** {{link}}

### Code Changes
- **Commits in window:** {{range}} ({{count}} commits)
- **PRs merged:** {{range}} ({{count}} PRs)
- **Deployments:** {{range}} ({{count}} deploys)
- **Suspected commit:** {{commit_link}}

### Screenshots
- [ ] Screenshot 1: {{description}}
- [ ] Screenshot 2: {{description}}

### Other Evidence
- **Browser console:** {{errors}}
- **Network requests:** {{link}}
- **Database state:** {{state}}
- **Cache state:** {{state}}

---

## Hypotheses Considered

| Hypothesis | Status | Evidence | Why Rejected/Confirmed |
|------------|--------|----------|------------------------|
| {{hypothesis_1}} | Rejected / Confirmed | {{evidence}} | {{reason}} |
| {{hypothesis_2}} | Rejected / Confirmed | {{evidence}} | {{reason}} |
| {{hypothesis_3}} | Rejected / Confirmed | {{evidence}} | {{reason}} |
| {{hypothesis_4}} | Rejected / Confirmed | {{evidence}} | {{reason}} |

---

## Root Cause

### Primary Root Cause
**Confidence:** High / Medium / Low

**Description:**
{{Detailed explanation of the confirmed root cause}}

**Contributing Factors:**
1. {{factor_1}}
2. {{factor_2}}
3. {{factor_3}}

**Evidence:**
- **Logs:** {{link}}
- **Code:** {{link}}
- **Configuration:** {{link}}
- **Data:** {{link}}

### Root Cause Category
- [ ] Code defect
- [ ] Configuration error
- [ ] Environment issue
- [ ] Third-party service issue
- [ ] Data corruption
- [ ] Race condition
- [ ] Resource exhaustion
- [ ] Network issue
- [ ] Other: {{specify}}

---

## Fix

### Solution Implemented
**Description:** {{fix_description}}

**Changes Made:**
- **Code changes:** {{pr_link}} ({{files_changed}} files)
- **Configuration changes:** {{changes}}
- **Data fixes:** {{changes}}
- **Infrastructure changes:** {{changes}}

### Fix Validation
- [ ] Fix verified in development environment
- [ ] Fix verified in staging environment
- [ ] Fix verified in production environment
- [ ] Regression tests pass
- [ ] No new errors introduced

### Minimal Reproducible Fix
**Description:** {{minimal_fix}}

**Code diff:**
```diff
{{diff}}
```

---

## Regression Prevention

### Test Coverage
- **Unit tests added:** {{count}}
- **Integration tests added:** {{count}}
- **E2E tests added:** {{count}}

### Monitoring
- **Alert added:** {{alert_description}}
- **Dashboard updated:** {{dashboard_link}}
- **Metric tracked:** {{metric}}

### Code Changes
- **Guardrails added:** {{description}}
- **Defensive programming:** {{description}}
- **Error handling improved:** {{description}}

---

## Residual Risks

1. {{risk_1}} - Likelihood: High / Medium / Low
2. {{risk_2}} - Likelihood: High / Medium / Low
3. {{risk_3}} - Likelihood: High / Medium / Low

**Mitigation:** {{mitigation_strategy}}

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

### Knowledge Gaps
1. {{gap_1}} - Training needed: {{training}}
2. {{gap_2}} - Documentation needed: {{documentation}}

---

## Time Tracking

| Phase | Start | End | Duration | Owner |
|-------|-------|-----|----------|-------|
| Investigation | {{date}} | {{date}} | {{duration}} | {{owner}} |
| Hypothesis testing | {{date}} | {{date}} | {{duration}} | {{owner}} |
| Fix implementation | {{date}} | {{date}} | {{duration}} | {{owner}} |
| Verification | {{date}} | {{date}} | {{duration}} | {{owner}} |
| **Total** | | | {{duration}} | |

---

## Appendix

### Related Issues
- **Duplicate of:** {{issue_number}}
- **Related to:** {{issue_numbers}}
- **Blocks:** {{issue_numbers}}
- **Blocked by:** {{issue_numbers}}

### External References
- **Documentation:** {{link}}
- **Stack Overflow:** {{link}}
- **GitHub issues:** {{link}}
- **Similar incidents:** {{incident_ids}}

---

## Related

- Workflow: [`workflows/dev/debug.md`](../../workflows/dev/debug.md)
- Prompt: [`prompts/debugging/root-cause-analysis.md`](../../prompts/debugging/root-cause-analysis.md)
- Conventions: [`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)

