# Workflow: code-review

Structured **code review** using bundled skills under [`skills/`](../../skills/). Produces actionable, severity-ranked feedback covering correctness, security, performance, maintainability, and test coverage.

**Domain:** `dev` — lives under **`workflows/dev/`**. **Filename:** `code-review.md`.

**Invoke:** `/code-review`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `code-review` |
| **version** | 1.1 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `review_target` | Yes | PR URL, branch name, file list, or pasted diff |
| `domain_stack` | No | Stack hint (e.g., "React + NestJS + PostgreSQL") — maps to `*-pro` skills |
| `review_focus` | No | Specific concerns: "security only", "performance", "test coverage" |

## Decision paths

- **No diff / empty PR:** Stop after Step 1; ask for `review_target` or paste.
- **`review_focus` set:** Run only the steps that match (e.g. security-only → Step 3 + Step 7); still produce a short summary stating scope.
- **Large diff (>500 lines changed)** — In Step 2, apply **risk tier** (see Step 2); in Step 7, set **Review scope** to **Partial** and list skipped paths.
- **Auth/payments/data deletion:** Never skip Steps 3–4 for those files even under time pressure.
- **Pure formatting / lockfile-only:** Skip Steps 4–5 unless `review_focus` requests them; note in report.

## Error handling

- **Cannot access repo:** Stop; output checklist: branch name, `git diff` range, or paste diff.
- **Step fails (missing tool, timeout):** Record partial findings; **do not** invent file:line references.
- **Merge conflicts:** Recommend resolving conflicts before review; if still asked, review base vs target explicitly.
- **Rollback:** No repo state change in this workflow; if bad advice was given, append correction in a follow-up note.

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)** (severity emoji, callouts).  
Final artifact MUST align with **[`templates/report/code-review.md`](../../templates/report/code-review.md)** (Verdict table, 🔴/🟡/🟢 sections, action items).

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Single file or < 200 lines | < 30 min |
| **Standard** | Typical PR | 1–3 h |
| **Deep** | Large diff, full stack, security focus | > 3 h |

## Escalation

- **Autonomous:** Correctness, style, tests, performance within pasted diff.
- **Human:** Legal/compliance, production incident context, **ambiguous auth** (missing product owner); **merge conflicts** blocking understanding.

## Outputs

| Variable | Description |
|----------|-------------|
| `review_report` | Structured feedback: Blocker / Important / Minor / Praise per file/section |
| `action_items` | Prioritized list of changes needed before merge |
| `risk_summary` | Security, performance, and correctness risks identified |

## Steps

### Step 1 — `stack-skill-selection`

- **Type:** skill
- **Skill:** `planning-pro`
- **Input:** `domain_stack`, `review_target` — identify which `*-pro` skills apply (e.g., `react-pro`, `nestjs-pro`, `testing-pro`, `security-pro`).
- **Output:** Named skill list for review.

### Step 2 — `correctness-review`

- **Type:** skill
- **Skill:** Domain skills from Step 1 (e.g., `react-pro`, `nestjs-pro`)
- **Input:** Diff / changed files
- **Actions:**
  1. Check logic correctness: edge cases, null handling, off-by-one, async race conditions.
  2. Verify API contracts: method signatures, return types, error propagation.
  3. Check for regressions in existing behavior.
  4. **Large diff (>500 lines):** Prioritize by **risk tier** — **Tier 1** (always review): auth, payments, data deletion, migrations, secrets; **Tier 2**: business logic, API surface, persistence; **Tier 3** (sample or spot-check): formatting, copy-only, pure UI with no data path. State what was skipped in the report.
- **Output:** Correctness findings (Blocker / Important).

### Step 3 — `security-review`

- **Type:** skill
- **Skill:** `security-pro` (+ `auth-pro` if auth is involved)
- **Input:** Diff — focus on input handling, auth checks, data exposure.
- **Actions:**
  1. OWASP Top 10: injection, XSS, insecure deserialization, broken access control.
  2. Secrets: hardcoded credentials, API keys, environment variable exposure.
  3. Auth: missing authorization checks, privilege escalation paths.
  4. Data exposure: PII in logs, over-fetching in API responses.
- **Output:** Security findings (Blocker if exploitable; Important if latent risk).

### Step 4 — `performance-review`

- **Type:** skill
- **Skill:** `performance-tuning-pro` (+ `caching-pro` if applicable, `postgresql-pro` for DB queries)
- **Input:** Diff — focus on hot paths, queries, loops.
- **Actions:**
  1. N+1 queries, missing indexes, unbounded queries.
  2. Expensive operations in render/request path.
  3. Missing caching opportunities.
  4. Memory leaks (event listeners, large allocations).
- **Output:** Performance findings (Important / Minor).

### Step 5 — `test-coverage-review`

- **Type:** skill
- **Skill:** `testing-pro`
- **Input:** Diff + test files
- **Actions:**
  1. Are new branches and edge cases covered?
  2. Test quality: assertions meaningful, not just existence checks.
  3. Missing integration or e2e coverage for user-facing paths.
  4. Flaky test patterns: time dependency, ordering, shared state.
- **Output:** Test coverage gaps (Important / Minor).

### Step 6 — `maintainability-review`

- **Type:** skill
- **Skill:** `clean-code-architecture-pro`
- **Input:** Diff
- **Actions:**
  1. Naming: variables, functions, types clearly express intent.
  2. Function size and complexity: single responsibility, cyclomatic complexity.
  3. Duplication: extract or share rather than copy.
  4. Documentation: complex logic needs a comment; obvious code does not.
- **Output:** Maintainability observations (Minor / Praise).

### Step 7 — `compile-review-report`

- **Type:** skill
- **Skill:** `feedback-pro`
- **Input:** Findings from Steps 2–6
- **Actions:**
  1. Deduplicate and group findings by file/component.
  2. Assign severity: **Blocker** (must fix before merge) / **Important** (should fix) / **Minor** (optional) / **Praise** (highlight good patterns).
  3. Write each finding as: Location → Issue → Recommendation → Code example (if helpful).
  4. Summarize risks at the top; include **Verdict** line (🔴 / 🟡 / 🟢) and **Review scope** (Full / Partial).
  5. Use the structure in **[`templates/report/code-review.md`](../../templates/report/code-review.md)** and emoji severity from **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)**.
- **Output:** `review_report`, `action_items`, `risk_summary`.

## Suggested review format

Use the **[code review report template](../../templates/report/code-review.md)** (Verdict table, numbered findings, action-item checklist). Minimal inline shape:

```markdown
# Code Review — {{pr_title}}

> **Verdict:** 🔴 DO NOT MERGE / 🟡 MERGE WITH FIXES / 🟢 APPROVE

### Risk summary
[2–3 sentences]

### 🔴 Blockers
- **`path:L45`** — [issue] → [fix]

### 🟡 Important
...

### 🟢 Minor
...

### ✅ Praise
...
```

## Notes

- Focus on **what matters most** — not every imperfection needs a comment; use Minor sparingly.
- Separate **blocking issues** from style preferences; never block on preferences alone.
- Always include a **positive observation** — reinforces good patterns.
- For large PRs (>500 lines), prioritize the most risky files; note what was not reviewed.
