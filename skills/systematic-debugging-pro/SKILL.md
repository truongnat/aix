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

### Operating principles

1. **Think Before Coding** — State what is known, what is assumed, and what is still unknown before forming any hypothesis. Assumptions that are wrong waste every subsequent step.
2. **Simplicity First** — Start with the most probable, simplest hypothesis. Don't skip to distributed systems or memory corruption when a typo or wrong config is equally plausible.
3. **Surgical Changes** — Never modify code to "see what happens" without first forming a testable hypothesis. Shotgun changes destroy the ability to attribute causation.
4. **Goal-Driven Execution** — Done = root cause identified, fix applied and the original symptom is gone under the same conditions it was originally triggered.
5. **One hypothesis at a time** — Change one variable per experiment; multiple simultaneous changes make causation impossible to establish.
6. **Reproduce before fixing** — A fix that cannot be verified against a reproduced symptom is speculation, not a fix.
7. **Verify the fix, not the attempt** — Confirm the original symptom is absent after the fix, not just that the code "looks right" or "should work".
8. **Document the learning** — Root cause and fix rationale belong in the commit message or incident note so future debuggers don't repeat the same path.

### 4-phase debugging process (summary)

Isolate → Reproduce → Analyze → Verify. Each phase has entry criteria and exit conditions. Skipping phases — especially Reproduce — is the most common source of failed fixes.

Details: [references/four-phase-process.md](references/four-phase-process.md)

### Hypothesis-driven investigation (summary)

Forming falsifiable hypotheses, ranking by probability, designing minimal experiments, interpreting negative results.

Details: [references/hypothesis-driven.md](references/hypothesis-driven.md)

### Debugging failure modes (summary)

Symptom chasing, confirmation bias, premature fixes, incomplete verification, "fix" that masks the root cause.

Details: [references/failure-modes.md](references/failure-modes.md)

## Suggested response format

1. **Context** — Symptom, environment, reproducibility, urgency (prod vs dev).
2. **Known / unknown / assumed** — Explicit knowledge audit before hypothesis formation.
3. **Hypothesis list** — Ranked by probability; most likely first.
4. **Experiment plan** — One step per hypothesis; what to change, what to observe.
5. **Root cause** — Confirmed diagnosis after experiments.
6. **Fix and verification** — Minimum change + how to confirm original symptom is gone.

## Resources in this skill

| Topic | File |
|-------|------|
| 4-phase debugging process | [references/four-phase-process.md](references/four-phase-process.md) |
| Hypothesis-driven investigation | [references/hypothesis-driven.md](references/hypothesis-driven.md) |
| Debugging failure modes | [references/failure-modes.md](references/failure-modes.md) |

## Quick example

**Input:** "My API endpoint sometimes returns 500 — not always reproducible."
- **Known:** 500 is intermittent. **Unknown:** which code path. **Assumed:** some state or timing dependency.
- **Hypothesis 1 (most likely):** Unhandled Promise rejection in async handler. **Hypothesis 2:** Race condition with shared state.
- **Experiment:** Add structured logging at entry/exit of the handler; capture the error and stack before it becomes a 500.
- **Root cause after logging:** Unhandled `null` dereference on optional DB field.
- **Fix:** Add null guard; add regression test for that code path.

**Input (tricky):** "The bug only reproduces in production, not locally."
- This is the most dangerous class — don't guess, don't deploy speculative fixes.
- **Reproduce strategy:** Match prod environment variables locally; add observability (logs, traces) to prod temporarily with feature flag.
- Only apply a fix after you can explain why local differs from prod and have confirmed the root cause via prod traces.
- Pair **`ci-cd-pro`** for feature-flagged logging deploys.

**Input (cross-skill):** "My React component infinite loops — where do I start?"
- **Isolate:** Which `useEffect` or state setter is looping? Add `console.log` with a render counter.
- **Hypothesis:** Dependency array contains an object reference that changes on every render.
- **Fix:** Move the object inside the effect or wrap with `useMemo`/`useRef`.
- Pair **`react-pro`** for rendering model and effect correctness rules.

## Checklist before calling the skill done

- [ ] Symptom reproduced under controlled conditions before any fix (Think Before Coding)
- [ ] Simplest hypothesis tested first — no premature escalation (Simplicity First)
- [ ] One variable changed per experiment — no shotgun debugging (Surgical Changes)
- [ ] Root cause identified, not just symptoms suppressed (Goal-Driven Execution)
- [ ] Original symptom confirmed absent after fix
- [ ] Fix is surgical — no unrelated code touched
- [ ] No new regressions introduced
- [ ] Root cause documented in commit message or incident note