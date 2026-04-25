---
name: systematic-debugging-pro
description: |
  Production-grade systematic debugging: 4-phase root cause process (isolate → reproduce → analyze → verify), hypothesis-driven investigation, root cause tracing techniques, defense-in-depth verification, and condition-based waiting — plus system model (symptom → hypothesis → experiment → conclusion), failure modes (symptom chasing, confirmation bias, premature fixes, incomplete verification), decision trade-offs (speed vs thoroughness, logging vs breakpoints, repro vs production), and quality guardrails (verifiable fixes, no regression, documented learning).

  Use this skill when the user asks to debug an issue, find root cause, investigate a bug, trace an error, or systematically solve a technical problem.

  Use **with** **`bug-discovery-pro`** for defect discovery patterns, **`testing-pro`** for verification tests, domain **`*-pro`** skills for technical depth, and **`git-operations-pro`** for bisecting history.

  Triggers: "debug", "debugging", "root cause", "investigate", "trace error", "find bug", "systematic debugging", "why is this failing".

metadata:
  short-description: Debugging — 4-phase process, hypothesis-driven, root cause tracing
  content-language: en
  domain: debugging
  level: professional
---

# Systematic debugging (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use references such as [Debugging Rules](https://www.amazon.com/Debugging-Rules-Software-Debugging/dp/007222548X) and [Google Debugging](https://testing.googleblog.com/2015/10/debugging-tales-from-field.html) for methodology; this skill encodes **hypothesis-driven investigation**, **root cause tracing**, **verification discipline**, and **systematic process** — not ad hoc troubleshooting.

## Boundary

**`systematic-debugging-pro`** owns **4-phase debugging process**, **hypothesis-driven investigation**, **root cause tracing**, and **verification discipline**. **`bug-discovery-pro`** owns **defect discovery patterns and telemetry analysis**. Domain **`*-pro`** skills own **technical depth within their stack**. **`git-operations-pro`** owns **history bisecting**. **`testing-pro`** owns **verification test design**.

## Related skills (this repo)

| Skill | When to combine with `systematic-debugging-pro` |
|-------|------------------------------------------------|
| **`bug-discovery-pro`** | Defect discovery, telemetry analysis, pattern recognition |
| **`testing-pro`** | Verification test design, regression testing |
| **Domain `*-pro` skills** | Stack-specific debugging techniques |
| **`git-operations-pro`** | Bisecting git history to find when bug was introduced |
| **`performance-tuning-pro`** | Performance-specific debugging |

## When to use

- Investigating a bug or error with unknown root cause.
- Tracing the source of unexpected behavior.
- Debugging complex or intermittent issues.
- Establishing systematic debugging practices.
- Teaching debugging methodology.

- Trigger keywords: `debug`, `debugging`, `root cause`, `investigate`, `trace error`, `find bug`, `systematic debugging`, `why is this failing`

## When not to use

- **Pure feature implementation** without debugging — domain skill.
- **Known issue with known fix** — just implement the fix.
- **Performance profiling** without debugging — **`performance-tuning-pro`**.
- **Incident response** without root cause focus — incident workflow.

## Required inputs

- **Symptom or error** (what's happening, what should happen).
- **Context**: environment, stack, recent changes.
- **Reproducibility** information (always, sometimes, never).

## Expected output

Follow **Suggested response format** strictly — 4-phase process with root cause and verification.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** symptom, context, reproducibility, and urgency (production vs development). → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.