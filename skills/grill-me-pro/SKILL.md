---
name: grill-me-pro
description: |
  Conduct a relentless, systematic interview about a plan or design — one question at a time — until every branch of the decision tree is resolved and both parties share a clear understanding. Does NOT produce a plan; produces shared understanding. Use when the user wants their design stress-tested, their assumptions challenged, or their thinking sharpened before committing to implementation.

  Triggers: "grill me", "stress-test this", "challenge my design", "interview me about", "push back on", "find holes in", "play devil's advocate", "critique my plan", "what am I missing".

  Combine with **`to-prd-pro`** after the interview to capture decisions, and **`brainstorming-pro`** to explore alternatives before narrowing.

metadata:
  short-description: Relentless one-question-at-a-time design interview to resolve decision trees
  content-language: en
  domain: planning
  level: professional
---

# grill-me (professional)

Skill text is **English**; answer in the user's preferred language when the conversation specifies it.

Interview the user relentlessly about a plan or design — **one question at a time** — until every branch of the decision tree is resolved and both parties have shared understanding.

## Boundary

**`grill-me-pro`** owns **design interviews and assumption surfacing**. **`to-prd-pro`** owns synthesising decisions into a PRD. **`brainstorming-pro`** owns generating alternatives.

## Related skills

| Skill | When to combine |
|-------|----------------|
| **`to-prd-pro`** | Capture resolved decisions as a PRD after the interview |
| **`brainstorming-pro`** | Generate and explore alternatives before narrowing |
| **`business-analysis-pro`** | Validate user stories and domain model |
| **`clean-code-architecture-pro`** | Stress-test architectural decisions |

## When to use

- Stress-testing a design, plan, workflow, or architecture before implementation.
- Surfacing hidden assumptions and unresolved decision branches.
- Forcing explicit trade-offs through a one-question-at-a-time interview.
- Preparing for a later PRD or implementation plan with better shared understanding.

## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** scope: what the user wants grilled (feature, architecture, workflow) → verify: [scope understood; relevant docs/code read].
2. **Think Before Coding** — build the decision tree internally before asking the first question; read the codebase to answer what code can answer.
3. **Simplicity First** — ask only questions that change what gets built; skip questions that can be self-answered.
4. **Surgical Changes** — one question per message; stay on the current branch until resolved.
5. **Goal-Driven Execution** — done when every branch of the decision tree is resolved and the summary is confirmed by the user.
6. **Respond** one question at a time with a recommended answer.

### Operating principles

1. **Think Before Coding** — read code and docs before asking; never ask what you can look up.
2. **Simplicity First** — fewest questions that resolve the tree; skip questions whose answers don't change the design.
3. **Surgical Changes** — one question per message, full stop.
4. **Goal-Driven Execution** — success = complete decision tree resolved; user confirms summary and next step.

## Suggested response format

Use this structure while running the interview:

1. **Current branch** — what decision is being probed and why it matters.
2. **One question** — exactly one question for the user.
3. **Recommended answer** — default recommendation with brief rationale.
4. **What changes depending on the answer** — why this branch matters to the eventual plan.

## Resources in this skill

- Decision tree discipline in this `SKILL.md` under `## Process` and `## Question quality bar`.
- Downstream synthesis pairing: **`to-prd-pro`** for turning resolved decisions into a PRD.
- Alternative-generation pairing: **`brainstorming-pro`** for widening options before narrowing.

## Quick example

User asks: "Grill me on this rollout plan for moving auth to FastAPI."

Response shape:
- State the current branch: migration shape, compatibility, or rollback.
- Ask one question only, such as the token-compatibility requirement.
- Give a recommended default answer with rationale.
- Wait for the user before moving to the next branch.

## Philosophy

A good design interview:
- Surfaces hidden assumptions before they become bugs.
- Forces explicit trade-off decisions rather than leaving them implicit.
- Walks the dependency graph: resolve foundational decisions before dependent ones.
- Asks about failure modes, not just the happy path.
- Offers a recommended answer for each question so the user can react rather than invent from scratch.

## Process

### 1. Understand the scope
Ask the user what they want grilled: a feature, an architecture, a business model, a workflow. Read any referenced code or documents before starting.

### 2. Build the decision tree (internally)
Map the major decisions and their dependencies. Start from the most foundational (changing them invalidates others) and work outward.

### 3. Interview — one question at a time
For each open node in the decision tree:
1. State what you are probing and why it matters.
2. Ask **exactly one question**.
3. Offer a **recommended answer** with brief rationale.
4. Wait for the user's response before moving to the next question.

Never bundle multiple questions. Never move forward until the current question is answered.

### 4. Explore the codebase to answer questions yourself
When a question can be resolved by reading the code (e.g., "does this table already exist?"), read it rather than asking the user. Report what you found before the next question.

### 5. Resolve branches
When the user's answer opens new sub-questions, explore that branch fully before returning to the main tree.

### 6. Conclude
When all major branches are resolved, summarise:
- Key decisions made and the rationale.
- Remaining open questions (if any) and who owns them.
- Recommended next step (e.g., "run `/to-prd-pro` to capture this").

## Question quality bar

Each question must meet **all** of:
- Answering it changes what gets built or how.
- It cannot be resolved by reading the codebase yourself.
- It has not been implicitly answered in prior conversation.

Skip questions that fail this bar.

## Checklist before calling the skill done

- [ ] Read codebase and docs before asking questions code can answer (Think Before Coding)
- [ ] Only asked questions whose answers change what gets built (Simplicity First)
- [ ] One question per message throughout the entire interview (Surgical Changes)
- [ ] Full decision tree resolved; summary confirmed by user (Goal-Driven Execution)
- [ ] Every question included a recommended answer
- [ ] No fabricated codebase facts in questions or follow-ups
