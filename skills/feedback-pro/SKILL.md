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