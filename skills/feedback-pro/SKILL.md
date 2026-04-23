---
name: feedback-pro
description: |
  Production-grade deep feedback for engineering and product: evidence-based review framing, review lifecycle (artifact → finding → action → verification), issue severity calibration, actionable recommendations, communication tone, decision trade-offs (depth vs velocity, async vs sync, block vs follow-up), failure modes (severity inflation, nit avalanches, ping-pong reviews, silent debt), quality guardrails (confidence labels, no invented evidence), and closure tracking.

  Use this skill when the user asks to give detailed feedback on code/docs/design/process decisions, review quality gaps, prioritize improvements, or convert raw comments into structured, high-impact feedback plans.

  Use **with** **`testing-pro`**, **`security-pro`**, **`planning-pro`**, **`git-operations-pro`**, **`business-analysis-pro`**, domain `*-pro` skills for technical truth, and **`skills-self-review-pro`** for meta review of templates in this repo.

  Triggers: "feedback", "review comments", "code feedback", "deep review", "improvement feedback", "critique", "quality review", "severity", "action items", "follow-up plan".

metadata:
  short-description: Feedback — review lifecycle, severity, actionable closure, failure modes
  content-language: en
  domain: feedback
  level: professional
---

# Feedback and review quality (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use references such as [Google Engineering Practices: Code Review](https://google.github.io/eng-practices/review/) for baseline norms; this skill encodes **evidence-first findings**, **lifecycle discipline**, **severity-aware prioritization**, and **constructive closure** — not generic “be nice” advice.

## Boundary

**`feedback-pro`** owns **how** to structure, prioritize, tone, and close feedback. **Domain `*-pro`** skills (**`security-pro`**, **`testing-pro`**, …) own whether a technical claim is **true**. **`business-analysis-pro`** owns **requirements alignment** when “correct behavior” is ambiguous.

## Related skills (this repo)

| Skill | When to combine with `feedback-pro` |
|-------|-------------------------------------|
| **`testing-pro`** | Coverage, repro, flaky-test feedback |
| **`security-pro`** | Threat severity and mitigation urgency |
| **Domain `*-pro` skills** | Correctness of specialized findings |
| **`business-analysis-pro`** | Requirement intent vs code feedback |
| **`planning-pro`** | Backlog shaping from review outcomes |
| **`git-operations-pro`** | PR hygiene, commit narrative |
| **`skills-self-review-pro`** | Meta: skill/review template quality in-repo |
| **`self-improve-agent-pro`** | Systematic uplift from recurring themes |

## When to use

- Turning vague comments into **specific**, **prioritized**, **actionable** feedback.
- Reviews with clear **evidence**, **impact**, and **severity** calibration.
- Executive summaries **plus** implementer-level detail.
- **Follow-up** tracking until verification or explicit risk acceptance.
- Trigger keywords: `feedback`, `review`, `critique`, `severity`, `action items`, `quality gaps`, `follow-up`

## When not to use

- **Pure technical answer** with no review structure (e.g. “what is JWT”) — domain skill only.
- **People/HR incidents** — use appropriate human channels; this skill covers **professional artifact review**, not mediation.

## Required inputs

- **Artifact scope** (PR, doc, design) and **audience** (peer, lead, exec).
- **Quality bar** or policy (e.g. must-have tests on auth paths) when known.

## Expected output

Follow **Suggested response format** strictly — lifecycle and risks explicit.

## Workflow

1. Confirm objective, scope, audience, and merge/release pressure.
2. Apply summaries; open `references/` for templates; defer **truth** of specialized claims to domain skills.
3. Respond with **Suggested response format**; include **failure modes** when review dynamics are risky.

### Operating principles

1. **Evidence before opinion** — Map findings to observable behavior or requirement mismatch — **`finding-structure-and-evidence.md`**.
2. **Severity reflects impact** — User/system risk first — **`severity-and-prioritization.md`**.
3. **Actionability is mandatory** — Next step + verification — **`action-planning-and-closure.md`**.
4. **Separate must-fix vs nice-to-have** — **`decision-framework-and-trade-offs.md`**.
5. **Tone critiques artifacts** — Not people — **`tips-and-tricks.md`**.
6. **Close the loop** — Done criteria or ticket — **`review-feedback-system-model.md`**.

### Review feedback system model (summary)

Lifecycle, roles, merge gate contract — **`review-feedback-system-model.md`**.

Details: [references/review-feedback-system-model.md](references/review-feedback-system-model.md)

### Failure modes — detection and mitigation (summary)

Inflation, ping-pong, nit avalanche, silent debt, AI noise — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Depth vs velocity; consensus vs escalate; summary-first layout — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Confidence labels; no fake paths/tickets/metrics — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Finding structure and evidence quality (summary)

Context, observation, impact, reproducible evidence — **`finding-structure-and-evidence.md`**.

Details: [references/finding-structure-and-evidence.md](references/finding-structure-and-evidence.md)

### Severity and prioritization framework (summary)

Risk matrix and remediation urgency — **`severity-and-prioritization.md`**.

Details: [references/severity-and-prioritization.md](references/severity-and-prioritization.md)

### Action planning and closure tracking (summary)

Owner-ready actions, checkpoints, verification — **`action-planning-and-closure.md`**.

Details: [references/action-planning-and-closure.md](references/action-planning-and-closure.md)

### Tips and tricks (summary)

Templates, phrasing, conflict reduction — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Conflict, low confidence, deadlines, overload, AI noise, timezones — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision trees (summary)

Block vs follow-up, severity, request changes vs comment — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Severity inflation, vague feedback — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

**`testing-pro`**, **`security-pro`**, **`planning-pro`**, **`business-analysis-pro`**, … — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

SHA context, rubric versioning — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Artifact type, audience, urgency (ship pressure), decision authority if known.
2. **Problem / goal** — What “good feedback” must achieve (merge bar, learning, stakeholder alignment).
3. **System design** — Feedback lifecycle for this case; roles — **`review-feedback-system-model.md`**.
4. **Decision reasoning** — Depth vs velocity; block vs ticket; async vs sync — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Deliverable sketch** — Summary table or checklist (findings with severity + confidence + evidence pointers) — **`quality-validation-and-guardrails.md`** for honesty about gaps.
6. **Trade-offs** — Thoroughness vs time; risk of deferral.
7. **Failure modes** — Review dynamics or evidence gaps — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Ambiguity, escalation to **`security-pro`** / **`business-analysis-pro`** / domain skills; unresolved dependencies.

## Resources in this skill

| Topic | File |
|-------|------|
| **Review feedback system model** | [references/review-feedback-system-model.md](references/review-feedback-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Finding structure and evidence | [references/finding-structure-and-evidence.md](references/finding-structure-and-evidence.md) |
| Severity and prioritization | [references/severity-and-prioritization.md](references/severity-and-prioritization.md) |
| Action planning and closure | [references/action-planning-and-closure.md](references/action-planning-and-closure.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** “Review this PR and give deep feedback, not just style.”  
**Expected output:** Full **Suggested response format** — evidence-backed findings, severity + **confidence**, must-fix vs follow-up, verification steps.

### 2 — Tricky (edge case)

**Input:** Two reviewers disagree on architecture; author blocked.  
**Expected output:** Consolidation path, single **decision owner**, product vs engineering split — **`edge-cases.md`**; **failure modes** ping-pong — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** Possible security issue; exploitability unclear.  
**Expected output:** **`feedback-pro`** structure + evidence gaps + **Low** confidence; **`security-pro`** for scenarios; no false **Critical** — **`quality-validation-and-guardrails.md`**.

## Checklist before calling the skill done

### Findings quality

- [ ] Findings include **evidence** and **impact**, not opinion-only — **`finding-structure-and-evidence.md`**.
- [ ] **Severity** and **confidence** explicit and consistent — **`severity-and-prioritization.md`**.
- [ ] **Must-fix** vs optional clearly split — **`decision-framework-and-trade-offs.md`**.

### Closure & handoff

- [ ] Actions are **actionable** with verification or ticket/risk acceptance — **`action-planning-and-closure.md`**.
- [ ] **Residual risks** and dependencies documented — **`review-feedback-system-model.md`**.
- [ ] **`security-pro`** / domain **`*-pro`** escalation path when impact exceeds generic code quality — **`integration-map.md`**.

### Dynamics

- [ ] **Failure modes** considered when review volume, conflict, or ship pressure is high — **`failure-modes-detection-mitigation.md`**.
- [ ] [anti-patterns.md](references/anti-patterns.md) checked for inflation and vague wording.
