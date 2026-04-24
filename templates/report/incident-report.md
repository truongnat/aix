# Incident Report — {{incident_id}}

> **Date:** {{date}}  
> **Severity:** SEV-1 (Critical) / SEV-2 (High) / SEV-3 (Medium) / SEV-4 (Low)  
> **Status:** Open / Mitigated / Resolved / Closed  
> **Incident Commander:** {{commander}}  
> **On-call Engineer:** {{oncall}}  
> **Affected Services:** {{services}}  
> **Duration:** {{duration}} ({{start_time}} to {{end_time}} UTC)

---

## Executive Summary

<!-- One paragraph: user impact, duration, root cause summary, current state, follow-up actions -->

---

## Timeline

| Time (UTC) | Event | Duration | Owner |
|------------|-------|----------|-------|
| {{timestamp}} | Detection | {{duration}} | {{owner}} |
| {{timestamp}} | Initial investigation started | {{duration}} | {{owner}} |
| {{timestamp}} | Mitigation actions started | {{duration}} | {{owner}} |
| {{timestamp}} | Service partially restored | {{duration}} | {{owner}} |
| {{timestamp}} | Service fully restored | {{duration}} | {{owner}} |
| {{timestamp}} | Incident declared resolved | {{duration}} | {{owner}} |

---

## Impact Assessment

### User Impact
- **Users affected:** {{count}} ({{percentage}}% of active users)
- **Geographic regions:** {{regions}}
- **User segments:** {{segments}}
- **Tenants affected:** {{count}} ({{tenant_names}})

### Business Impact
- **Revenue impact:** ${{amount}} ({{duration}})
- **Customer SLA breach:** Yes / No
  - **SLA target:** {{target}}
  - **Actual:** {{actual}}
  - **Breach duration:** {{duration}}
- **Customer trust impact:** High / Medium / Low
- **Compliance impact:** Yes / No
  - {{compliance_details}}

### Technical Impact
- **Services degraded:** {{services}}
- **Services unavailable:** {{services}}
- **Data loss:** Yes / No
  - **Data affected:** {{description}}
  - **Recovery:** {{status}}
- **Performance degradation:** {{percentage}}%
- **Error rate increase:** {{percentage}}%

---

## Root Cause Analysis

### Primary Root Cause
**Confidence:** High / Medium / Low

**Description:**
{{Detailed explanation of the primary cause}}

**Contributing Factors:**
1. {{factor_1}}
2. {{factor_2}}
3. {{factor_3}}

### Timeline of Root Cause
| Time | Event | Evidence |
|------|-------|----------|
| {{time}} | {{event}} | {{link}} |
| {{time}} | {{event}} | {{link}} |

### Five Whys Analysis
1. **Why did this happen?** {{answer}}
2. **Why did that happen?** {{answer}}
3. **Why did that happen?** {{answer}}
4. **Why did that happen?** {{answer}}
5. **Why did that happen?** {{answer}}

---

## What Happened

### Detection
- **How detected:** {{method}} (monitoring alert / user report / automated test)
- **Detection time:** {{timestamp}}
- **Detection latency:** {{duration}} (time from issue start to detection)
- **Alerts triggered:** {{alerts}}

### Mitigation Actions
| Time | Action | Owner | Result |
|------|--------|-------|--------|
| {{time}} | {{action}} | {{owner}} | {{result}} |
| {{time}} | {{action}} | {{owner}} | {{result}} |

### Communication
- **Internal notifications:** {{channels}} ({{timing}})
- **External notifications:** {{channels}} ({{timing}})
- **Status page updates:** {{frequency}}
- **Customer communications:** {{method}} ({{timing}})

---

## Resolution

### Fix Applied
**Description:** {{fix_description}}

**Rollback:** Yes / No
- **Reason:** {{reason}}
- **Rollback steps:** {{steps}}

### Verification
- [ ] Service restored to normal operation
- [ ] Error rates returned to baseline
- [ ] Performance metrics within SLO
- [ ] No data corruption
- [ ] Monitoring alerts cleared

### Post-Incident Metrics
| Metric | Pre-Incident | During Incident | Post-Incident | Status |
|--------|--------------|-----------------|----------------|--------|
| Error rate | {{value}} | {{value}} | {{value}} | ✅ / ❌ |
| Latency (p95) | {{value}} | {{value}} | {{value}} | ✅ / ❌ |
| Throughput | {{value}} | {{value}} | {{value}} | ✅ / ❌ |

---

## Follow-up Actions

### Immediate (within 24 hours)
- [ ] Post-incident review scheduled ({{date}})
- [ ] Action items tracked in {{system}}
- [ ] Monitoring alerts updated
- [ ] Documentation completed

### Short-term (within 1 week)
- [ ] {{action_1}} ({{owner}}, {{due_date}})
- [ ] {{action_2}} ({{owner}}, {{due_date}})
- [ ] {{action_3}} ({{owner}}, {{due_date}})

### Long-term (within 1 month)
- [ ] {{action_1}} ({{owner}}, {{due_date}})
- [ ] {{action_2}} ({{owner}}, {{due_date}})
- [ ] {{action_3}} ({{owner}}, {{due_date}})

---

## Lessons Learned

### What Went Well
1. {{lesson_1}}
2. {{lesson_2}}
3. {{lesson_3}}

### What Could Be Improved
1. {{lesson_1}}
2. {{lesson_2}}
3. {{lesson_3}}

### Process Improvements
1. **Monitoring:** {{improvement}}
2. **Alerting:** {{improvement}}
3. **Runbooks:** {{improvement}}
4. **Training:** {{improvement}}
5. **Communication:** {{improvement}}
6. **Architecture:** {{improvement}}

### Technical Improvements
1. {{improvement_1}}
2. {{improvement_2}}
3. {{improvement_3}}

---

## Appendix

### Logs and Evidence
- **Error logs:** {{link}} (redacted)
- **Metrics:** {{link}}
- **Traces:** {{link}}
- **Screenshots:** {{link}}
- **Chat logs:** {{link}}

### Changes Made
- **Code changes:** {{pr_link}}
- **Configuration changes:** {{commit_link}}
- **Infrastructure changes:** {{change_link}}

### Related Incidents
- **Duplicate of:** {{incident_id}}
- **Related to:** {{incident_ids}}
- **Blocked by:** {{incident_ids}}

---

## Related

- Workflow: [`workflows/dev/incident.md`](../../workflows/dev/incident.md)
- Conventions: [`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)

