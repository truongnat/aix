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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** objective, scope, audience, and merge/release pressure. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm artifact, audience, and decision pressure before shaping feedback. Ask whether the goal is merge-blocking review, improvement coaching, or executive prioritization.
2. **Simplicity First** — Lead with the few highest-signal findings first. Do not bury important risks inside exhaustive but low-value commentary.
3. **Surgical Changes** — Comment only on issues supported by evidence and relevant to the scope. Do not expand into adjacent style debates or speculative concerns.
4. **Goal-Driven Execution** — Done = findings are actionable, prioritized, and tied to a closure path or explicit risk acceptance.
5. **Evidence before opinion** — Every substantive finding should point to observable behavior, policy, or concrete code/doc evidence.
6. **Severity should change decisions** — Labels matter only if they drive prioritization, blocking, or follow-up intensity.
7. **One finding, one action** — Bundle related evidence, but do not merge unrelated issues into vague “cleanup” commentary.
8. **Closure is part of feedback** — A review is incomplete if it cannot tell whether the issue was fixed, deferred, or consciously accepted.

## Default recommendations by scenario

- **Code review** — Lead with correctness, risk, and missing verification before style.
- **Design/process critique** — Focus on user or operational impact, then remediation path.
- **Executive summary** — Compress to the smallest set of decision-relevant findings with severity.
- **Follow-up review** — Verify whether previous findings were actually resolved or only reframed.

## Decision trees

Summary: choose feedback depth and severity framing based on audience, artifact risk, and whether the review is blocking or advisory.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: severity inflation, nit avalanches, feedback without evidence, and reviews that create action churn without closure.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Review feedback system model (summary)

How findings should move from evidence to action to verification so reviews improve quality instead of just creating comments.

Details: [references/review-feedback-system-model.md](references/review-feedback-system-model.md)

### Finding structure and evidence (summary)

How to write findings that are concrete, scoped, and defensible.

Details: [references/finding-structure-and-evidence.md](references/finding-structure-and-evidence.md)

### Severity and prioritization (summary)

How to calibrate urgency and communicate which items block, follow up, or can be deferred.

Details: [references/severity-and-prioritization.md](references/severity-and-prioritization.md)

### Action planning and closure (summary)

How to turn review output into tracked next steps and verified closure.

Details: [references/action-planning-and-closure.md](references/action-planning-and-closure.md)

## Suggested response format

1. **Context** — Artifact, audience, review goal, and release/decision pressure.
2. **Findings** — Highest-severity issues first, each with evidence and impact.
3. **Recommended actions** — Concrete next steps or fixes tied to each finding.
4. **Verification or closure** — How to prove resolution or record risk acceptance.
5. **Residual risks** — Gaps not fully resolved by the current feedback cycle.

## Resources in this skill

| Topic | File |
|-------|------|
| Review feedback system model | [references/review-feedback-system-model.md](references/review-feedback-system-model.md) |
| Finding structure and evidence | [references/finding-structure-and-evidence.md](references/finding-structure-and-evidence.md) |
| Severity and prioritization | [references/severity-and-prioritization.md](references/severity-and-prioritization.md) |
| Action planning and closure | [references/action-planning-and-closure.md](references/action-planning-and-closure.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Review this auth PR and tell me what actually blocks merge."
- Lead with correctness and risk findings, not low-value polish.
- Tie each blocking item to concrete evidence and an expected fix or test.
- **Verify:** The author can tell exactly what must change before merge.

**Input (tricky):** "There are 40 comments but most are bikeshedding."
- Collapse noise into low-priority notes and surface only the few issues that affect behavior or maintainability materially.
- Do not present equal-severity formatting nits and security gaps as the same class of problem.
- **Verify:** The feedback output has a clear severity order and reduced churn.

**Input (cross-skill):** "Turn this security review into an action plan."
- Pair **`security-pro`** for technical truth and **`feedback-pro`** for structured prioritization and closure language.
- Convert findings into owned actions and verification steps.
- **Verify:** Each security finding has an action, owner, or explicit risk acceptance path.

## Checklist before calling the skill done

- [ ] Artifact, audience, and review goal confirmed before shaping feedback (Think Before Coding)
- [ ] Highest-signal findings prioritized; no unnecessary review noise added (Simplicity First)
- [ ] Only evidence-backed, in-scope issues were raised (Surgical Changes)
- [ ] Success criteria, actions, and closure/verification path are explicit (Goal-Driven Execution)
- [ ] Findings include concrete evidence and impact
- [ ] Severity labels are calibrated and decision-relevant
- [ ] Follow-up actions are actionable rather than vague
- [ ] Residual risks or accepted debt are stated clearly
