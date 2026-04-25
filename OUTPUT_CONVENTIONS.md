# 📋 Output & Report Standards — For Agents and Humans

> **Date:** 2026-04-25  
> **Author:** truongdq1  
> **Version:** 1.1  
> **Status:** Complete

---

## 🎯 Purpose

Standardize output presentation for:

* Debugging / Root Cause Analysis (RCA)
* Code Review
* Security Audit
* Performance Analysis
* Incident Reports
* AI Workflows

Requirements:

* Unified format
* Easy to read and scan
* Always leads to concrete action
* Applies to both humans and automated systems

---

# 🚨 1. Severity Levels

| Level | Symbol | Meaning |
|-------|--------|---------|
| Critical | 🔴 | System-blocking, must fix immediately |
| High | 🟡 | Major impact, prioritize |
| Medium | 🟠 | Issues present, should improve |
| Low | 🟢 | Not required |
| Good | ✅ | Meets standard |
| In Progress | 🔵 | Currently working |
| Not Applicable | ⚪ | Out of scope |

---

# 📦 2. Information Blocks

```markdown
> [!NOTE]
> Additional information

> [!TIP]
> Best practice / optimization

> [!WARNING]
> Risk warning

> [!CAUTION]
> Critical danger
```

---

# 🧾 3. Report Header

```markdown
# {{Report Type}} — {{Subject}}

> **Date:** {{ISO date}}  
> **Author:** {{name}}  
> **Version:** {{version}}  
> **Status:** Draft | Complete | Superseded  
> **Confidence:** High | Medium | Low
```

---

# 🌍 4. Context

```markdown
## Context

- System:
- Scope:
- Environment:
- Assumptions:
- Constraints:
```

---

# ❗ 5. Issue

```markdown
## Issue

- Expected:
- Actual:
- Impact:
```

---

# 🧠 6. Analysis

```markdown
## Analysis

- Observations:
- Hypothesis:
- Verification:
- Root Cause:
```

---

# 🧪 7. Reproduction Steps

```markdown
## Steps to Reproduce

1. Step 1
2. Step 2
3. Expected result
4. Actual result
```

---

# ⚠️ 8. Findings

```markdown
## Findings

| Issue | Severity | Description | Impact |
|-------|----------|-------------|--------|
| Example | 🔴 | Description | Impact |
```

---

# 🧨 9. Priority Issues

```markdown
## Priority Issues

1. 🔴 Issue A  
2. 🔴 Issue B  
3. 🟡 Issue C  
```

---

# ⚖️ 10. Decisions

```markdown
## Decisions

| Decision | Owner | Deadline | Status |
|----------|-------|----------|--------|
| Fix A | Backend | 2026-04-25 | 🔵 |
```

> [!CAUTION]
> This section is mandatory.

---

# 🛠 11. Recommendations

**Current:**

```typescript
// current code
```

**Proposed:**

```typescript
// modified code
```

---

# 📊 12. Progress

```markdown
## Progress

| Step | Status | Notes |
|------|--------|-------|
| Reproduce | ✅ | |
| Analyze | 🔵 | |
| Fix | ⚪ | |
```

---

# 💥 13. Impact

```markdown
## Impact

- Affected users:
- Systems:
- Risk level:
```

---

# 🧭 14. Trade-offs

```markdown
## Trade-offs

- Quick fix vs long-term solution  
- Performance vs cost  
- Simplicity vs extensibility  
```

---

# 🧾 15. Code Block Rules

```typescript
const example = true;
```

```bash
npm run start
```

---

# 🤖 16. Token Tracking

```text
[Tokens: I:{{input}} | O:{{output}} | T:{{total}}]
```

---

| Metric | Value | Notes |
|--------|-------|-------|
| Input tokens | | |
| Output tokens | | |
| Total tokens | | |
| Total steps | | |

---

# 🧩 17. Scope

* Code Review
* Debugging / RCA
* Security Audit
* Performance Analysis
* Incident Reports
* AI Workflows

---

# 🏁 Principles

1. Clear, unambiguous
2. Always has root cause
3. Every issue leads to action
4. Prioritize by impact
5. Maintain consistent format

---
