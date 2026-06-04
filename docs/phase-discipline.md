# Phase Discipline — The Operating Contract

This is the canonical source for phase discipline rules. All other documents (AGENTS.md, SYSTEM_PROMPT.md, command docs, prompt templates) reference this single source of truth.

---

## The Command Loop

All work follows this strict sequence:

```
Session Start → Map → Discuss → Plan → Run → Verify → Ship → Remember
```

**Never skip phases.** Never jump ahead without completing preconditions.

---

## Phase Sequence & Order

| # | Command | Purpose |
|---|---|---|
| **0** | `harness-start` | Restore active session, memory, current phase, blocked state |
| **1** | `harness-map` | Understand the affected area and current state |
| **2** | `harness-discuss` | Clarify goal, scope, constraints, and alternatives |
| **3** | `harness-plan` | Write the plan; stop before implementation |
| **4** | `harness-run` | Follow the approved plan; update state as you go |
| **5** | `harness-verify` | Gather fresh evidence; pass/fail/partial with proof |
| **6** | `harness-ship` | Create reports and handoff notes from real changes |
| **7** | `harness-remember` | Store durable lessons, decisions, and constraints |

---

## Phase Preconditions

Before entering each phase, these conditions **MUST** be met:

### harness-start (Session Start)
- **Entry:** No active session is known, OR user says "continue" / "what next"
- **Required:** Read AGENTS.md when entering a repository
- **Output:** Active session, goal, phase, and next command are explicit
- **Block If:** Current session state is ambiguous or conflicting

### harness-map (Context Mapping)
- **Entry:** The task area is not yet fully understood
- **Required:** Read active `.harness/` artifacts; inspect repository boundaries
- **Output:** Affected areas, current state, and key unknowns are explicit
- **Block If:** Codebase state conflicts with recorded artifacts

### harness-discuss (Clarification)
- **Entry:** Goal, scope, constraints, or alternatives are still ambiguous
- **Required:** Capture constraints, assumptions, alternatives
- **Output:** Goal, boundaries, and recommended approach are clear without inventing requirements
- **Block If:** Material tradeoffs need human approval

### harness-plan (Planning)
- **Entry:** Goal is understood well enough to break into tasks
- **Required:** Write scope, affected areas, verification strategy, risks into `.harness/PLAN.md`
- **Output:** Concrete, ordered plan with verification strategy; no implementation started
- **Block If:** Plan still leaves major ambiguity or requires risky operations

### harness-run (Implementation)
- **Entry:** An **approved** plan exists and is current
- **Required:** Follow the plan; update task/state artifacts as you go
- **Output:** Planned work is implemented or explicitly paused with blockers documented
- **Block If:** Work needs a materially different approach or broader scope than planned

### harness-verify (Verification)
- **Entry:** A change or result is ready to be checked
- **Required:** Run fresh verification commands; record manual checks; document what was skipped
- **Output:** Pass / fail / partial status with **real evidence** (not confidence)
- **Block If:** Evidence is missing, contradictory, or incomplete

### harness-ship (Handoff)
- **Entry:** Verification is completed or its gaps are clearly documented
- **Required:** Create reports from actual changes; match summary and risk to reality
- **Output:** Reports, PR notes, and handoff summary ready for humans
- **Block If:** Shipping requires accepting known risk that has not been approved

### harness-remember (Memory)
- **Entry:** Verified work produced a durable lesson, decision, or constraint
- **Required:** Concise, reusable note; checked for sensitive data
- **Output:** Recorded in `.harness/REMEMBER.md` or project memory
- **Block If:** The note contains secrets or private business data

---

## Hard Stops (No Exceptions)

These are non-negotiable:

1. **`harness-run` MUST NOT start** if:
   - `PLAN.md` is missing
   - `PLAN.md` has not been approved
   - The current state is unknown

2. **`harness-verify` MUST NOT pass** on:
   - "Looks right" confidence
   - Optimistic prose
   - Untested assumptions
   - Only pass with real evidence

3. **`harness-ship` MUST NOT claim success** without:
   - Explicit verification evidence
   - Real inspection of changes
   - Clear residual risk statement

4. **Never claim evidence that wasn't run:**
   - Do not pretend a test passed if you didn't run it
   - Do not summarize risky gaps as success
   - Do not hide failing tests

---

## Blocked State (Valid Result)

Blocked is a **valid** phase outcome. When blocked:

1. Identify what's missing (input, information, approval, capability)
2. Record blocked state in `.harness/BLOCKED.md` or `VERIFY.md`
3. Return only the blocked response format
4. **Do not continue the phase**

---

## Redirect Rules

When a command's preconditions fail:

1. **Stop immediately**
2. **Name the missing condition** (e.g., "PLAN.md not approved")
3. **Name the correct next command** (e.g., "Run harness-plan first")
4. **Ask for missing input if needed** (stop after asking, don't guess)

Example redirect:
```
Blocked: precondition failed.
Run harness-plan first.
```

---

## Evidence Standard (Critical)

Every completion claim **MUST** be backed by evidence.

### Valid Evidence

- Command output (exit code 0)
- Test results (passing tests, pass rate)
- Build or lint output
- Inspected diff with line numbers
- Manual check result (what you tested, what passed)
- Reviewer or verifier result envelope (from WORKER_RUN)

### Invalid Evidence

- Confidence ("I'm pretty sure this works")
- Optimistic prose ("This should work")
- Skipped checks ("I didn't run X because it seemed obvious")
- Assumptions ("This won't break anything")

---

## Common Phase Failures (Anti-Patterns)

### Map Phase
- ❌ Guessing architecture instead of reading code
- ❌ Mapping too broadly
- ❌ Skipping active `.harness/` artifacts
- ✅ Read all active artifacts first, then inspect code

### Discuss Phase
- ❌ Silent scope expansion
- ❌ Fake certainty about unclear tradeoffs
- ❌ Mixing assumptions with confirmed facts
- ✅ Write constraints and alternatives explicitly

### Plan Phase
- ❌ Vague tasks ("fix the bug" instead of "add bounds check to line 42")
- ❌ No verification strategy
- ❌ Mixing planning with implementation
- ✅ Write concrete, ordered tasks with verification steps

### Run Phase
- ❌ Scope drift (doing extra cleanup not in the plan)
- ❌ Stale task tracking
- ❌ Unplanned destructive changes
- ✅ Follow the plan; pause and ask when scope changes

### Verify Phase
- ❌ Claiming "looks good" without running tests
- ❌ Hiding skipped checks
- ❌ Using stale verification from earlier
- ✅ Run fresh commands; document what you checked and results

### Ship Phase
- ❌ Overstating confidence
- ❌ Hiding residual risk
- ❌ Treating partial verification as a full pass
- ✅ Match the summary and risk to actual evidence

### Remember Phase
- ❌ Storing secrets or business data
- ❌ Storing temporary logs or transient noise
- ❌ Recording the same lesson twice
- ✅ Store durable, reusable, non-sensitive lessons only

---

## Phase Duration Expectations

| Phase | Typical Duration | Risk If Too Long |
|---|---|---|
| Map | 5–30 min | Over-exploration; lost momentum |
| Discuss | 5–20 min | Analysis paralysis; unclear decision |
| Plan | 10–30 min | Incomplete verification strategy |
| Run | 30 min–2h | Scope creep; stale task tracking |
| Verify | 10–30 min | Partial verification; hidden gaps |
| Ship | 5–15 min | Wrong summary; missing risk statement |
| Remember | 5–10 min | Sensitive data stored; duplicate notes |

---

## Session Memory

All phase artifacts live in `.harness/` and are the source of truth:

- `.harness/STATE.md` — current state
- `.harness/PLAN.md` — the approved plan
- `.harness/TASKS.md` — current task list (updated by harness-run)
- `.harness/VERIFY.md` — verification evidence and status
- `.harness/SHIP.md` — reports and handoff notes
- `.harness/REMEMBER.md` — durable lessons
- `.harness/BLOCKED.md` — blocked state and why

---

## Provider Behavior

All providers (Claude, Cursor, Codex, Gemini) **MUST** follow these phase discipline rules identically.

Provider-specific behavior (native commands, workers, hooks) is described elsewhere. Phase discipline is **not** provider-specific.

See `docs/provider-rule-configuration.md` for provider differences.

---

## Quick Reference

| Need | Go To |
|---|---|
| Learn the phases | This document (read "The Command Loop") |
| Check preconditions | This document (section "Phase Preconditions") |
| Understand blocked state | This document (section "Blocked State") |
| See quality gates | `docs/quality-gates-matrix.md` |
| See command docs | `commands/harness-*.md` |
| See provider setup | `docs/provider-rule-configuration.md` |
| See agent behavior | `AGENTS.md` + `agent-system/SYSTEM_PROMPT.md` |

