---
name: brainstorming-pro
description: |
  Production-grade Socratic brainstorming: structured ideation with question-driven refinement, assumption surfacing, alternative generation, constraint exploration, feasibility filtering, and convergence to actionable options — plus system model (raw ideas → structured exploration → convergence), failure modes (groupthink, premature convergence, solution-first thinking, analysis paralysis), decision trade-offs (breadth vs depth, speed vs quality, divergent vs convergent phases), and quality guardrails (no solution before problem, explicit assumptions, verifiable criteria).

  Use this skill when the user asks to brainstorm solutions, explore alternatives, generate ideas for a feature or problem, refine concepts through questioning, or structure ideation sessions.

  Use **with** **`planning-pro`** for detailed implementation plans, **`business-analysis-pro`** for requirements alignment, **`strategic-consulting-pro`** for portfolio-level options, and domain **`*-pro`** skills for technical feasibility.

  Triggers: "brainstorm", "ideas", "alternatives", "explore options", "what if", "generate solutions", "ideation", "concept exploration", "solution space", "design alternatives".

metadata:
  short-description: Brainstorming — Socratic refinement, assumption surfacing, convergence
  content-language: en
  domain: ideation
  level: professional
---

# Brainstorming and ideation (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use references such as [IDEO Design Thinking](https://www.designthinking.ideo.com/) and [SCAMPER technique](https://www.designthinking.ideo.com/) for ideation methods; this skill encodes **question-driven exploration**, **assumption explicitness**, **structured divergence**, and **convergence discipline** — not generic "think outside the box" advice.

## Boundary

**`brainstorming-pro`** owns **structured ideation**, **question-driven exploration**, **assumption surfacing**, and **convergence to actionable options**. **`business-analysis-pro`** owns **requirements discovery and validation**. **`planning-pro`** owns **detailed implementation planning**. Domain **`*-pro`** skills own **technical feasibility** within options. **`strategic-consulting-pro`** owns **portfolio-level prioritization**.

## Related skills (this repo)

| Skill | When to combine with `brainstorming-pro` |
|-------|------------------------------------------|
| **`business-analysis-pro`** | Requirements alignment before ideation |
| **`planning-pro`** | Converting converged options to implementation plans |
| **`strategic-consulting-pro`** | Portfolio-level option evaluation |
| **Domain `*-pro` skills** | Technical feasibility assessment of options |
| **`feedback-pro`** | Refining ideas through structured critique |

## When to use

- Generating solution alternatives for a defined problem or opportunity.
- Exploring "what if" scenarios and constraint variations.
- Structuring ideation sessions with question-driven refinement.
- Surfacing hidden assumptions and exploring their implications.
- Converging from raw ideas to actionable, prioritized options.
- Trigger keywords: `brainstorm`, `ideas`, `alternatives`, `explore options`, `what if`, `generate solutions`, `ideation`, `concept exploration`

## When not to use

- **Pure requirements elicitation** without solution space exploration — **`business-analysis-pro`** first.
- **Detailed implementation planning** — **`planning-pro`** after convergence.
- **Technical feasibility deep dive** on a single option — domain **`*-pro`** skills.
- **Executive strategic decisions** without option generation — **`strategic-consulting-pro`** may lead.

## Required inputs

- **Problem or opportunity statement** (what "better" means).
- **Constraints** when known: time, budget, technical, regulatory.
- **Stakeholders** affected by the solution.

## Expected output

Follow **Suggested response format** strictly — raw ideas through convergence with residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** problem/opportunity, constraints, stakeholders, ideation horizon → verify: [scope defined].
2. **State assumptions** about problem framing, success criteria (**Think Before Coding**).
3. **Apply** minimum ideation structure first; add complexity only when justified (**Simplicity First**).
4. **Make surgical changes** — focus on specific problem area, don't expand scope (**Surgical Changes**).
5. **Define success criteria** (convergence criteria, decision deadline); loop until verified (**Goal-Driven Execution**).
6. **Respond** with **Suggested response format**; include **failure modes** when group dynamics or solution bias are risks.

### Operating principles

1. **Think Before Coding** — State assumptions about problem framing, constraints. Ask when uncertain.
2. **Simplicity First** — Start with basic ideation; add structured methods only when needed.
3. **Surgical Changes** — Focus ideation on specific problem area; don't expand scope unnecessarily.
4. **Goal-Driven Execution** — Define convergence criteria and decision deadlines upfront.
5. **Question before answer** — Use Socratic questioning to refine ideas, not assert solutions — **`socratic-techniques.md`**.
6. **Surface assumptions explicitly** — Make hidden constraints visible before committing — **`assumption-surfacing.md`**.
7. **Diverge before converge** — Generate breadth before filtering — **`divergence-convergence.md`**.
8. **Explore constraints as design variables** — Not just blockers — **`constraint-exploration.md`**.
9. **Converge with criteria** — Verifiable filters, not gut feel — **`convergence-methods.md`**.
10. **Document the journey** — Show how ideas evolved — **`ideation-system-model.md`**.

### Ideation system model (summary)

Raw ideas → structured exploration → convergence to options — **`ideation-system-model.md`**.

Details: [references/ideation-system-model.md](/skills/brainstorming-pro/references/ideation-system-model.md)

### Socratic questioning techniques (summary)

Question types for refinement: why, what if, how else, what's missing — **`socratic-techniques.md`**.

Details: [references/socratic-techniques.md](/skills/brainstorming-pro/references/socratic-techniques.md)

### Assumption surfacing (summary)

Identifying hidden constraints and testing their validity — **`assumption-surfacing.md`**.

Details: [references/assumption-surfacing.md](/skills/brainstorming-pro/references/assumption-surfacing.md)

### Divergence and convergence (summary)

Balancing breadth generation with focused filtering — **`divergence-convergence.md`**.

Details: [references/divergence-convergence.md](/skills/brainstorming-pro/references/divergence-convergence.md)

### Constraint exploration (summary)

Treating constraints as design variables, not blockers — **`constraint-exploration.md`**.

Details: [references/constraint-exploration.md](/skills/brainstorming-pro/references/constraint-exploration.md)

### Convergence methods (summary)

Criteria-based filtering to reach actionable options — **`convergence-methods.md`**.

Details: [references/convergence-methods.md](/skills/brainstorming-pro/references/convergence-methods.md)

### Failure modes (summary)

Groupthink, premature convergence, solution-first thinking, analysis paralysis — **`failure-modes.md`**.

Details: [references/failure-modes.md](/skills/brainstorming-pro/references/failure-modes.md)

### Decision framework (summary)

Breadth vs depth, speed vs quality, individual vs group ideation — **`decision-framework.md`** + **`decision-tree.md`**.

Details: [references/decision-framework.md](/skills/brainstorming-pro/references/decision-framework.md)

### Anti-patterns (summary)

Solution-first, assumption blindness, premature filtering — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](/skills/brainstorming-pro/references/anti-patterns.md)

### Tips and tricks (summary)

Facilitation techniques, remote brainstorming tools, warm-up exercises — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](/skills/brainstorming-pro/references/tips-and-tricks.md)

### Edge cases (summary)

Time pressure, dominant personalities, unclear problem, technical complexity — **`edge-cases.md`**.

Details: [references/edge-cases.md](/skills/brainstorming-pro/references/edge-cases.md)

### Cross-skill handoffs (summary)

**`business-analysis-pro`**, **`planning-pro`**, **`strategic-consulting-pro`**, domain **`*-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](/skills/brainstorming-pro/references/integration-map.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Problem/opportunity, constraints, stakeholders, ideation horizon (breadth vs depth).
2. **Problem / goal** — What success means; non-goals and boundaries.
3. **System design** — Ideation flow: divergence → exploration → convergence — **`ideation-system-model.md`**.
4. **Decision reasoning** — Breadth vs depth; individual vs group; convergence criteria — **`decision-framework.md`** / **`decision-tree.md`**.
5. **Ideation output** — Structured options table with assumptions, feasibility notes, and convergence criteria — **`convergence-methods.md`**.
6. **Trade-offs** — Speed vs quality; breadth vs depth; risk of missing options.
7. **Failure modes** — Group dynamics risks, solution bias — **`failure-modes.md`** themes.
8. **Residual risks** — Assumptions untested; escalation to **`business-analysis-pro`** / domain skills; next steps for validation.

## Resources in this skill

| Topic | File |
|-------|------|
| **Ideation system model** | [references/ideation-system-model.md](/skills/brainstorming-pro/references/ideation-system-model.md) |
| Socratic techniques | [references/socratic-techniques.md](/skills/brainstorming-pro/references/socratic-techniques.md) |
| Assumption surfacing | [references/assumption-surfacing.md](/skills/brainstorming-pro/references/assumption-surfacing.md) |
| Divergence & convergence | [references/divergence-convergence.md](/skills/brainstorming-pro/references/divergence-convergence.md) |
| Constraint exploration | [references/constraint-exploration.md](/skills/brainstorming-pro/references/constraint-exploration.md) |
| Convergence methods | [references/convergence-methods.md](/skills/brainstorming-pro/references/convergence-methods.md) |
| Failure modes | [references/failure-modes.md](/skills/brainstorming-pro/references/failure-modes.md) |
| Decision framework | [references/decision-framework.md](/skills/brainstorming-pro/references/decision-framework.md) |
| Decision trees | [references/decision-tree.md](/skills/brainstorming-pro/references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](/skills/brainstorming-pro/references/anti-patterns.md) |
| Tips | [references/tips-and-tricks.md](/skills/brainstorming-pro/references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](/skills/brainstorming-pro/references/edge-cases.md) |
| Integration map | [references/integration-map.md](/skills/brainstorming-pro/references/integration-map.md) |

## Quick example

### 1 — Simple (common)

**Input:** "Brainstorm ways to improve our API response times."  
**Expected output:** Full **Suggested response format** — divergent options (caching, CDN, optimization, architecture change), assumption surfacing, convergence criteria, feasibility notes.

### 2 — Tricky (edge case)

**Input:** Team stuck on one solution; need to break groupthink.  
**Expected output:** Socratic questioning sequence, constraint exploration, forced alternatives — **`socratic-techniques.md`**, **`failure-modes.md`** for groupthink mitigation.

### 3 — Cross-skill

**Input:** New feature opportunity with unclear requirements.  
**Expected output:** **`brainstorming-pro`** structured options — **`business-analysis-pro`** for requirements validation — **`planning-pro`** for implementation planning of converged option.

## Checklist before calling the skill done

### Structure & quality

- [ ] Problem/opportunity and constraints explicit — **`ideation-system-model.md`**.
- [ ] Divergence before convergence followed — **`divergence-convergence.md`**.
- [ ] Assumptions surfaced and documented — **`assumption-surfacing.md`**.

### Convergence

- [ ] Convergence criteria verifiable, not subjective — **`convergence-methods.md`**.
- [ ] Options table includes feasibility notes and risk flags — **`ideation-system-model.md`**.

### Dynamics

- [ ] **Failure modes** considered for groupthink or premature convergence — **`failure-modes.md`**.
- [ ] **Anti-patterns** checked for solution-first thinking — **`anti-patterns.md`**.

### Handoff

- [ ] **`business-analysis-pro`** escalation path when requirements unclear — **`integration-map.md`**.
- [ ] **`planning-pro`** handoff ready for converged options — **`integration-map.md`**.
