# Code Review — {{pr_title}}

> **Date:** {{date}}  
> **Reviewer:** {{reviewer}}  
> **Target:** {{branch_or_pr}}  
> **Author:** {{author}}  
> **Files changed:** {{file_count}}  
> **Lines added:** {{lines_added}}  
> **Lines deleted:** {{lines_deleted}}

---

## Executive Summary

<!-- 2-3 sentences: overall quality assessment, primary concerns, merge recommendation -->

---

## Verdict

| | |
|--|--|
| **Decision** | 🔴 DO NOT MERGE \| 🟡 MERGE WITH FIXES \| 🟢 APPROVE |
| **Confidence** | High / Medium / Low |
| **Scope** | Full \| Partial (note what was skipped) |
| **Estimated effort to fix** | {{hours}} hours |

---

## Risk Assessment

| Risk Category | Severity | Impact |
|---------------|----------|--------|
| Security | Critical / High / Medium / Low / None | |
| Performance | Critical / High / Medium / Low / None | |
| Maintainability | Critical / High / Medium / Low / None | |
| Test coverage | Critical / High / Medium / Low / None | |
| Documentation | Critical / High / Medium / Low / None | |

---

## 🔴 Blockers

> Must be resolved before merge.

### B1 — {{issue_title}}

- **Severity:** Critical
- **Location:** `path/to/file.ts:42`
- **Category:** Security / Performance / Maintainability / Logic / Other
- **Issue:** Detailed description of the problem
- **Impact:** What happens if this ships
- **Recommendation:** Specific fix suggestion
- **Evidence:** Code snippet, logs, or reference

```typescript
// Before
{{code_before}}

// After
{{code_after}}
```

---

## 🟡 Important

> Should fix before merge in a strict release; address soon otherwise.

### I1 — {{issue_title}}

- **Severity:** High
- **Location:** `path/to/file.ts:42`
- **Category:** Security / Performance / Maintainability / Logic / Other
- **Issue:** Detailed description
- **Impact:** What happens if this ships
- **Recommendation:** Specific fix suggestion

---

## 🟢 Minor

> Optional; do not block merge.

### M1 — {{issue_title}}

- **Severity:** Low
- **Location:** `path/to/file.ts:42`
- **Category:** Style / Documentation / Optimization / Other
- **Issue:** Description
- **Recommendation:** Suggestion

---

## ✅ Praise

> 1–3 genuinely good patterns worth highlighting.

### P1 — {{pattern_title}}

- **Location:** `path/to/file.ts:42`
- **Why it's good:** Explanation
- **Consider:** Suggest adopting elsewhere

---

## Architecture & Design

- **Adherence to patterns:** Yes / No / Partial
- **Separation of concerns:** Yes / No / Partial
- **Error handling:** Adequate / Needs improvement / Missing
- **Type safety:** Strong / Weak / Mixed
- **Scalability concerns:** None / Minor / Significant

---

## Testing

- **Test coverage:** {{percentage}}%
- **New tests added:** {{count}}
- **Test quality:** Good / Needs improvement
- **Edge cases covered:** Yes / Partial / No
- **Integration tests:** Yes / No / N/A

---

## Documentation

- **Code comments:** Adequate / Sparse / Excessive
- **README updated:** Yes / No / N/A
- **API docs updated:** Yes / No / N/A
- **Changelog updated:** Yes / No / N/A

---

## Performance

- **Performance impact:** Positive / Neutral / Negative
- **Database queries:** Optimized / Needs review / Not applicable
- **Memory usage:** Acceptable / Concerning / Unknown
- **Caching strategy:** Appropriate / Missing / N/A

---

## Security

- **Input validation:** Present / Missing / Partial
- **Output encoding:** Present / Missing / Partial
- **Authentication/authorization:** Correct / Needs review / N/A
- **Secrets handling:** Secure / Exposed / N/A
- **Dependencies:** Up to date / Vulnerable / Unknown

---

## Action Items

### Must fix before merge
- [ ] B1 — {{issue_title}} ({{effort}} hours)
- [ ] B2 — {{issue_title}} ({{effort}} hours)

### Should fix soon
- [ ] I1 — {{issue_title}} ({{effort}} hours)
- [ ] I2 — {{issue_title}} ({{effort}} hours)

### Optional improvements
- [ ] M1 — {{issue_title}} ({{effort}} hours)

---

## Follow-up

- **Review required:** Yes / No
- **Follow-up issue:** {{issue_number}} (if applicable)
- **Discussion points:** 
  - Point 1
  - Point 2

---

## Related

- Workflow: [`workflows/dev/code-review.md`](../../workflows/dev/code-review.md)
- Conventions: [`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)

