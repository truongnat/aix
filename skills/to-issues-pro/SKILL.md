---
name: to-issues-pro
description: |
  Break a plan, PRD, or GitHub issue into independently-implementable GitHub issues using vertical tracer-bullet slices. Each issue cuts end-to-end through all layers (UI → API → DB) rather than horizontal layer-by-layer decomposition. Classifies issues as HITL (requires human review) or AFK (can be implemented autonomously). Use when the user has a spec or PRD and wants to turn it into an actionable issue backlog.

  Triggers: "break this into issues", "create GitHub issues", "to-issues", "slice this into tickets", "make issues from the PRD", "vertical slices", "tracer bullets".

  Combine with **`to-prd-pro`** to produce the PRD first, and **`planning-pro`** for dependency ordering and milestone sequencing.

metadata:
  short-description: Break plans/PRDs into vertical-slice GitHub issues (HITL vs AFK classified)
  content-language: en
  domain: planning
  level: professional
---

# to-issues (professional)

Skill text is **English**; answer in the user's preferred language when the conversation specifies it.

Convert a high-level plan, PRD, or GitHub issue into independently-implementable GitHub issues using **vertical tracer-bullet slices** — each issue delivers a narrow but complete path through every integration layer.

## Boundary

**`to-issues-pro`** owns **issue decomposition and GitHub issue creation**. **`to-prd-pro`** owns PRD synthesis. **`planning-pro`** owns milestone sequencing.

## Related skills

| Skill | When to combine |
|-------|----------------|
| **`to-prd-pro`** | Produce the PRD before decomposing into issues |
| **`planning-pro`** | Sequence issues across milestones |
| **`executing-plans-pro`** | Execute individual issues once created |
| **`writing-plans-pro`** | Write detailed implementation plans per issue |

## When to use

- Turning a PRD, plan, or epic into independently implementable vertical-slice issues.
- Classifying backlog items into AFK versus HITL execution.
- Preparing a dependency-aware GitHub issue backlog from existing source material.
- Converting broad work into narrow, mergeable tracer-bullet slices.

## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** source (PRD issue URL, conversation context, or codebase) → verify: [source readable; `gh` available or fallback ready].
2. **Think Before Coding** — read the PRD or codebase before drafting slices; ask only for genuinely ambiguous scope.
3. **Simplicity First** — minimum slices that cover the PRD; no speculative future issues.
4. **Surgical Changes** — each issue touches only what it must; no cross-slice side-effects.
5. **Goal-Driven Execution** — done when all issues are created (or printed) and the user confirms the list.
6. **Respond** using Suggested response format.

### Operating principles

1. **Think Before Coding** — read the PRD and codebase before proposing slices; don't decompose from memory.
2. **Simplicity First** — fewest slices that deliver the full PRD; merge thin issues rather than fragment.
3. **Surgical Changes** — each slice must be independently mergeable with no half-finished layer work.
4. **Goal-Driven Execution** — success = all issues created in dependency order, user confirms list.

## Suggested response format

Use this structure for issue decomposition:

1. **Source and scope** — what document or context is being decomposed.
2. **Slice list** — issue titles with the user-visible behavior each slice delivers.
3. **Classification** — AFK vs HITL for each issue and why.
4. **Dependencies** — ordering, blockers, and what can run in parallel.
5. **Creation result** — GitHub issue URLs or rendered markdown fallback.
6. **Residual risks** — ambiguity, missing acceptance criteria, or sequencing concerns.

## Resources in this skill

- This `SKILL.md` section `## Core concept: vertical slices vs horizontal slices` — decomposition standard.
- This `SKILL.md` section `## Issue Template` — canonical issue body shape.
- Pair with **`to-prd-pro`** when the upstream specification is still implicit.

## Quick example

User asks: "Break this checkout PRD into GitHub issues."

Response shape:
- Read the PRD and current codebase context first.
- Produce a short list of end-to-end slices such as cart persistence, payment submission, and receipt flow.
- Mark which slices are AFK vs HITL and list dependencies.
- Create issues in dependency order or print them if `gh` is unavailable.

## Core concept: vertical slices vs horizontal slices

| Horizontal (avoid) | Vertical / tracer bullet (prefer) |
|--------------------|----------------------------------|
| "Build all DB schema" | "User can log in with email — touches auth UI, API, session, DB" |
| "Build all API endpoints" | "User can view their profile — touches profile page, GET /me, users table" |
| Layer-by-layer | End-to-end narrow path per issue |

Each vertical slice is independently deployable and testable.

## Process

### 1. Gather context
- Read the conversation, referenced PRD, or fetch the GitHub issue URL the user provides.
- If unclear, explore the codebase to understand current state before decomposing.

### 2. Draft slices
Propose 5–15 vertical slices depending on complexity. For each slice state:
- The end-to-end user-facing behaviour it delivers
- Which integration layers it touches
- Whether it blocks other slices

### 3. Classify: HITL vs AFK
- **HITL** (Human In The Loop) — requires architectural decisions, design review, or stakeholder sign-off before proceeding.
- **AFK** (Away From Keyboard) — can be implemented autonomously without human interaction. Prefer AFK where possible.

### 4. Confirm with user
Before creating issues, present the slice list and ask:
- Correct granularity? (merge / split as needed)
- Any missing slices?
- Dependency order correct?

### 5. Create GitHub issues in dependency order
Use the template below for each issue. Create with `gh issue create`.

---

## Issue Template

```markdown
## Parent

<!-- Link to parent PRD issue or epic if applicable -->
Closes #<parent-issue>

## Description

<!-- End-to-end behaviour this issue delivers, from the user's perspective.
     Focus on what changes, not how. -->

## Acceptance Criteria

- [ ] <observable behaviour 1>
- [ ] <observable behaviour 2>
- [ ] Tests cover the new behaviour
- [ ] No regressions in related flows

## Blocked by

<!-- List other issues that must be merged before this one, or "none" -->
- #<blocking-issue> — <reason>

## Classification

<!-- HITL or AFK -->
**Type**: AFK
```

## Output

- GitHub issues created via `gh issue create` in dependency order.
- Print a summary table: issue number, title, type (HITL/AFK), blocked-by.
- If `gh` is not available, print all issues as rendered markdown.

## Checklist before calling the skill done

- [ ] Read source material before drafting slices — no decomposition from memory (Think Before Coding)
- [ ] Minimum slices that cover the full PRD; no speculative future issues (Simplicity First)
- [ ] Each slice independently mergeable with no partial layer work (Surgical Changes)
- [ ] All issues created in dependency order; user confirmed the list (Goal-Driven Execution)
- [ ] AFK issues have unambiguous acceptance criteria
- [ ] HITL issues have explicit review trigger and owner
