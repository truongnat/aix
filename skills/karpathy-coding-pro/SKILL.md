---
name: karpathy-coding-pro
description: |
  Andrej Karpathy's 4 principles for LLM-assisted coding: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution. Derived from Karpathy's observations on common LLM coding pitfalls.

  Use this skill when the user wants to improve LLM coding behavior, reduce unnecessary changes, get cleaner diffs, or explicitly apply Karpathy's philosophy to any coding task.

  Use **with** any domain skill (`react-pro`, `auth-pro`, etc.) to apply Karpathy principles in that domain.

  Triggers: "Karpathy", "think before coding", "simplicity first", "surgical changes", "goal-driven", "fewer unnecessary changes", "cleaner diffs", "reduce overengineering", "stop guessing", "ask before assuming".

metadata:
  short-description: Karpathy principles — Think, Simplicity, Surgical, Goal-Driven
  content-language: en
  domain: meta-coding
  level: professional
---

# Karpathy Coding Principles (professional)

Skill text is **English**; answer in the user's preferred language when rules or the conversation specify it.

Derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls. These 4 principles reduce costly mistakes and produce cleaner, more maintainable code.

## Boundary

**`karpathy-coding-pro`** owns **coding behavior and process improvement** across all domains. It does not replace domain skills (`react-pro`, `auth-pro`, etc.) — combine with them to apply principles in specific contexts.

## Related skills (this repo)

| Skill | When to combine with `karpathy-coding-pro` |
|-------|-----------------------------------------------|
| **Any domain skill** (`react-pro`, `auth-pro`, etc.) | Apply Karpathy principles in that domain |
| **`skills-self-review-pro`** | Audit skill quality against Karpathy standards |
| **`self-improve-agent-pro`** | Harvest Karpathy-style improvements |

## When to use

- User complains about "too many unnecessary changes" in diffs.
- User wants "cleaner PRs" without drive-by refactoring.
- Overengineering detected — complexity beyond what was asked.
- LLM assumes too much without asking clarifying questions.
- Need explicit verification criteria before declaring done.

## When not to use

- **Trivial tasks** (simple typo fixes, obvious one-liners) — use judgment, not full rigor.
- **Pure refactoring requests** — use domain-specific refactoring skills.

## Required inputs

- The 4 principles to apply: Think, Simplicity, Surgical, Goal-Driven.
- Domain context (combine with relevant skill).

## Expected output

Follow **Suggested response format (STRICT)** — apply Karathy principles to the specific coding task.

## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** which principles to emphasize → verify: [principles selected].
2. **Think Before Coding** — state assumptions; ask when uncertain.
3. **Simplicity First** — minimum solution; escalate only when justified.
4. **Surgical Changes** — only touch code directly related to the request.
5. **Goal-Driven Execution** — define success criteria; loop until verified.
6. **Respond** using **Suggested response format (STRICT)**.

### Operating principles

1. **Think Before Coding**
   - State assumptions explicitly — if uncertain, ask rather than guess
   - Present multiple interpretations — don't pick silently when ambiguity exists
   - Push back when warranted — if a simpler approach exists, say so
   - Stop when confused — name what's unclear and ask for clarification

2. **Simplicity First**
   - Minimum code that solves the problem. Nothing speculative.
   - No features beyond what was asked
   - No abstractions for single-use code
   - No "flexibility" or "configurability" that wasn't requested
   - If 200 lines could be 50, rewrite it

3. **Surgical Changes**
   - Touch only what you must. Clean up only your own mess.
   - Don't "improve" adjacent code, comments, or formatting
   - Don't refactor things that aren't broken
   - Match existing style, even if you'd do it differently
   - Remove imports/variables/functions that YOUR changes made unused

4. **Goal-Driven Execution**
   - Define success criteria. Loop until verified.
   - Transform imperative tasks into verifiable goals
   - State brief plan with verification: `Step → verify: [check]`
   - Strong success criteria let the agent loop independently

### Applying principles in practice (summary)

Domain-specific application patterns — **`applying-principles-in-practice.md`**.

Details: [references/applying-principles-in-practice.md](/skills/karpathy-coding-pro/references/applying-principles-in-practice.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Task, domain, which Karpathy principles apply.
2. **Assumptions stated** — What was clarified, what remains ambiguous.
3. **Minimum solution** — Simplest approach that solves the problem.
4. **Surgical plan** — Exactly which files/lines will change.
5. **Success criteria** — How to verify the solution works.
6. **Code** — Implementation with minimal diff.
7. **Verification** — Confirm success criteria met.
8. **Residual risks** — What could still go wrong.

## Resources in this skill

| Topic | File |
|-------|------|
| Applying principles in practice | [references/applying-principles-in-practice.md](/skills/karpathy-coding-pro/references/applying-principles-in-practice.md) |

## Quick example

### 1 — Simple (Think + Simplicity)

**Input:** "Add a login button"  
**Expected output:**
- **Ask:** Where? What action on click? Styling requirements?
- **Minimum:** Basic button with click handler → verify works
- **Then:** Add styling/auth integration only if requested

### 2 — Tricky (Surgical Changes)

**Input:** "Fix the login bug"  
**Expected output:**
- Only touch login-related code
- Don't refactor unrelated auth flows
- Clean diff showing **only** login fix
- Mention dead code noticed but don't delete unless asked

### 3 — Cross-skill (Goal-Driven)

**Input:** "Implement auth system"  
**Expected output:**
- **Plan:**
  1. Basic session auth → verify: [can log in/out]
  2. Add JWT if needed → verify: [token validation works]
  3. Add refresh logic → verify: [token refresh test passes]
  4. Security review → verify: [no bypass found]
- Loop until each verification passes

## Checklist before calling the skill done

- [ ] **Think Before Coding:** Assumptions stated explicitly; asked when uncertain.
- [ ] **Simplicity First:** Started with minimum solution; complexity justified.
- [ ] **Surgical Changes:** Only touched code related to the request.
- [ ] **Goal-Driven Execution:** Success criteria defined and verified.
