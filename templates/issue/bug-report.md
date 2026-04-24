# Bug: {{title}}

> **Priority:** P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)  
> **Severity:** SEV-1 / SEV-2 / SEV-3 / SEV-4  
> **Status:** Open / In Progress / In Review / Verified / Closed  
> **Reporter:** {{reporter}}  
> **Assignee:** {{assignee}}  
> **Created:** {{date}}  
> **Labels:** {{labels}}

---

## Summary

{{One paragraph describing the bug and its impact on users or the system}}

---

## Environment

| Environment | Version / Configuration |
|-------------|-------------------------|
| **Application** | {{app_name}} v{{version}} |
| **Frontend** | {{framework}} v{{version}} |
| **Backend** | {{framework}} v{{version}} |
| **Database** | {{database}} v{{version}} |
| **OS / Browser** | {{os_or_browser}} {{version}} |
| **Region / Tenant** | {{region}} / {{tenant}} |
| **Device** | Desktop / Mobile / Tablet |
| **Screen size** | {{resolution}} |

---

## Steps to Reproduce

1. Navigate to {{page_or_feature}}
2. Click on {{element}}
3. Enter {{input}}
4. Press {{action}}
5. Observe {{expected_behavior}}

**Actual result:** {{what_actually_happens}}

**Expected result:** {{what_should_happen}}

---

## Reproduction Rate

- **Always:** 100% of attempts
- **Sometimes:** {{percentage}}% of attempts
- **Rarely:** {{percentage}}% of attempts
- **Unable to reproduce:** See additional context below

**Conditions that affect reproduction:**
- {{condition_1}}
- {{condition_2}}
- {{condition_3}}

---

## Impact Assessment

### User Impact
- **Users affected:** {{count}} ({{percentage}}% of user base)
- **Geographic regions:** {{regions}}
- **User segments:** {{segments}}
- **Workaround available:** Yes / No
  - **Workaround description:** {{workaround}}

### Business Impact
- **Revenue impact:** High / Medium / Low / None
- **Customer trust impact:** High / Medium / Low / None
- **Compliance impact:** Yes / No
- **SLA impact:** Yes / No

### Technical Impact
- **System stability:** Degraded / Unaffected
- **Data loss risk:** Yes / No
- **Security risk:** Yes / No
- **Performance degradation:** Yes / No

---

## Evidence

### Screenshots
- [ ] Screenshot 1: {{description}}
- [ ] Screenshot 2: {{description}}

### Logs
- **Error logs:** {{log_link}} (redacted, no secrets)
- **Application logs:** {{log_link}}
- **System logs:** {{log_link}}

### Traces
- **Trace ID:** {{trace_id}}
- **APM link:** {{apm_link}}

### Network
- **Request headers:** (redacted)
- **Response headers:** (redacted)
- **Request payload:** (redacted)
- **Response payload:** (redacted)

### Database
- **Query executed:** {{query}}
- **Query plan:** {{plan_link}}

### Other
- **Browser console:** {{errors}}
- **Video recording:** {{link}}

---

## Root Cause Analysis (if known)

### Hypothesis 1
- **Description:** {{description}}
- **Evidence:** {{evidence}}
- **Status:** Confirmed / Rejected / In Progress

### Hypothesis 2
- **Description:** {{description}}
- **Evidence:** {{evidence}}
- **Status:** Confirmed / Rejected / In Progress

### Suspected Component
- [ ] Frontend
- [ ] Backend API
- [ ] Database
- [ ] Third-party service
- [ ] Infrastructure
- [ ] Configuration
- [ ] Other: {{specify}}

---

## Related Issues

- **Duplicate of:** {{issue_number}}
- **Related to:** {{issue_numbers}}
- **Blocks:** {{issue_numbers}}
- **Blocked by:** {{issue_numbers}}

---

## Acceptance Criteria

- [ ] Bug is reproduced in development environment
- [ ] Root cause is identified
- [ ] Fix is implemented
- [ ] Fix is tested with regression tests
- [ ] Fix is deployed to staging
- [ ] Fix is verified in staging
- [ ] Fix is deployed to production
- [ ] Fix is verified in production

---

## Additional Context

**First reported by:** {{reporter}} on {{date}}

**Last occurrence:** {{date}}

**Frequency:** {{frequency}}

**Additional notes:**
{{any_other_relevant_information}}

---

## Related

- Prompt: [`prompts/debugging/bug-report.md`](../../prompts/debugging/bug-report.md)
- Workflow: [`workflows/dev/debug.md`](../../workflows/dev/debug.md)
- Conventions: [`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)

