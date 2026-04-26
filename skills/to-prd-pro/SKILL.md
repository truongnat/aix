---
name: to-prd-pro
description: |
  Convert the current conversation context and codebase understanding into a structured PRD, then submit it as a GitHub issue. Synthesizes what is already known — does NOT interview the user. Use when the user wants to produce a PRD, write up a feature spec, or capture a product decision as a GitHub issue.

  Triggers: "write a PRD", "create a spec", "turn this into a PRD", "open a GitHub issue for this", "document this feature", "to-prd", "make a product doc".

  Combine with **`to-issues-pro`** to break the resulting PRD into vertical-slice GitHub issues, and **`planning-pro`** for milestone sequencing.

metadata:
  short-description: Synthesize conversation context into a structured PRD and GitHub issue
  content-language: en
  domain: planning
  level: professional
---

# to-prd (professional)

Skill text is **English**; answer in the user's preferred language when the conversation specifies it.

Turn the current conversation context and codebase into a PRD submitted as a GitHub issue. **Do NOT interview the user** — synthesize what is already known, then confirm module scope before writing.

## Boundary

**`to-prd-pro`** owns **PRD synthesis and GitHub issue creation**. **`to-issues-pro`** owns breaking a PRD into individual implementation issues. **`planning-pro`** owns roadmaps and milestone sequencing.

## Related skills

| Skill | When to combine |
|-------|----------------|
| **`to-issues-pro`** | Break PRD into vertical-slice GitHub issues |
| **`planning-pro`** | Sequence milestones and dependencies |
| **`grill-me-pro`** | Stress-test the design before writing the PRD |
| **`business-analysis-pro`** | Validate user stories and acceptance criteria |

## When to use

- Turning an agreed problem or feature direction into a structured PRD.
- Capturing product and implementation decisions from the current conversation and codebase.
- Opening a GitHub issue that acts as the feature spec.
- Writing a spec without re-interviewing the user from scratch.

## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** scope, repo access, and GitHub CLI availability → verify: [can read codebase; `gh` present or fallback ready].
2. **Think Before Coding** — state what is known and what is assumed; ask only if critical info is missing.
3. **Simplicity First** — synthesise minimum PRD that addresses the problem; no speculative scope.
4. **Surgical Changes** — only assert codebase facts you actually read; no invented file paths.
5. **Goal-Driven Execution** — define done as: PRD issue created (or printed) and confirmed by user.
6. **Respond** using Suggested response format.

### Operating principles

1. **Think Before Coding** — synthesise from context; don't interview. State assumptions in Further Notes.
2. **Simplicity First** — PRD scope must match the problem, not the maximum possible feature set.
3. **Surgical Changes** — only reference modules you read; no speculative architecture.
4. **Goal-Driven Execution** — PRD is done when the GitHub issue URL is confirmed or the markdown is handed to the user.

## Suggested response format

Use this structure for PRD synthesis:

1. **Scope and context** — problem, repo context, and assumptions.
2. **Module sketch** — major modules or interfaces affected.
3. **PRD body** — problem statement, solution, user stories, implementation/testing decisions, out of scope, further notes.
4. **Submission result** — GitHub issue URL or rendered markdown fallback.
5. **Residual risks** — unresolved assumptions or scope boundaries that still need review.

## Resources in this skill

- This `SKILL.md` section `## PRD Template` — canonical output format.
- This `SKILL.md` section `## Process` — synthesize from code/context before writing.
- Pair with **`to-issues-pro`** after the PRD is accepted and needs backlog slicing.

## Quick example

User asks: "Turn this discussion about notification batching into a PRD and open an issue."

Response shape:
- Read the relevant modules and restate the known scope.
- Sketch the major modules and confirm there is enough context.
- Produce the PRD body with user stories and implementation decisions.
- Create the GitHub issue or print the markdown if `gh` is unavailable.

## Process

### 1. Explore the codebase
If not already done, read the relevant modules to understand current state. Identify what exists vs what must be built or changed.

### 2. Sketch deep modules
List the major modules to build or modify. Prioritise **deep modules** — high functionality behind a simple, stable interface that can be tested in isolation (vs shallow modules that just shuffle data).

Present the module list to the user and ask:
- Does this match their expectations?
- Which modules do they want tests written for?

### 3. Write and submit the PRD
Use the template below. Submit as a GitHub issue via `gh issue create`.

---

## PRD Template

```markdown
## Problem Statement

<!-- From the user's perspective: what pain, gap, or opportunity does this address? -->

## Solution

<!-- From the user's perspective: what will exist when this is done? -->

## User Stories

A numbered list covering all aspects of the feature.
Format: "As a <actor>, I want <feature>, so that <benefit>."

1. As a …, I want …, so that …
2. …

(Aim for 10–20 stories. Be exhaustive.)

## Implementation Decisions

- Modules to build / modify and their interfaces
- Architectural decisions and trade-offs chosen
- Schema changes and API contracts
- Technical clarifications from the developer

Do NOT include specific file paths or code snippets — they become outdated quickly.

## Testing Decisions

- What makes a good test for this feature (test external behaviour, not implementation)
- Which modules will have tests
- Prior art: similar test patterns already in the codebase

## Out of Scope

<!-- What this PRD explicitly does not cover -->

## Further Notes

<!-- Anything else relevant: dependencies, risks, open questions -->
```

## Output

- A GitHub issue created with `gh issue create --title "..." --body "..."`.
- Confirm the issue URL with the user when done.
- If `gh` is not available, print the rendered PRD in a markdown code block.

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked only when critical info was missing (Think Before Coding)
- [ ] PRD scope matches the problem, not speculative extensions (Simplicity First)
- [ ] Only referenced modules and facts actually read from the codebase (Surgical Changes)
- [ ] GitHub issue created (or markdown printed) and confirmed by user (Goal-Driven Execution)
- [ ] Implementation Decisions at interface level — no internal file paths
- [ ] Further Notes captures open questions and scope boundaries
