# harness-build

## Purpose

Build a project-specific harness profile before implementation work begins.

## When To Use

- when adopting the harness into a new host repository
- when the current project has no explicit harness profile
- when a project changes enough that workflow, team pattern, skills, gates, or memory rules must be reset

## Required Reads

- `AGENTS.md`
- `TARGET.md`
- `docs/gap-analysis.md`
- `docs/system-positioning.md`
- `docs/team-architecture-selection.md`
- `docs/memory-model.md`
- `docs/memory-safety.md`
- `docs/sdlc-execution-model.md`
- `docs/harness-build-contract.md`
- `docs/skill-system.md`
- `skills/SKILL_AUTHORING_RULES.md`
- `.harness/PROJECT.md` if present
- `.harness/REQUIREMENTS.md` if present
- `.harness/ROADMAP.md` if present
- relevant workflow, pattern, and skill pack documents

## Skills To Use

- `using-harness`
- `mapping-codebase`
- `discussing-goals`
- `writing-plans`

## Step-By-Step Workflow

1. Read the existing project artifacts and identify the host repository shape, delivery model, and risk profile.
2. Determine the most relevant workflows, team patterns, core skills, and skill packs for the project using `docs/skill-system.md`.
3. Define the harness profile boundaries: what the harness must guide, what it will not manage, and where human approval is required.
4. Select the initial team architecture pattern using `docs/team-architecture-selection.md` and record why it fits this project better than the simpler alternatives.
5. Initialize `.harness/MEMORY.md` using `docs/memory-model.md` and `docs/memory-safety.md`, including recall rules, allowed memory types, and storage boundaries.
6. Select the execution workflow using `docs/sdlc-execution-model.md`, including goal lifecycle, task lifecycle, and review and verification expectations.
7. Define the quality gates the project should apply before run, verify, ship, and remember phases are considered complete.
8. Write the selected operating model to the harness profile artifacts.
9. Stop after the harness profile is complete. Do not implement application code.

## Output Artifacts

- `.harness/HARNESS.md`
- `.harness/TEAM.md`
- `.harness/SKILLS.md`
- `.harness/WORKFLOW.md`
- `.harness/GATES.md`
- `.harness/MEMORY.md`

## Completion Gate

The command is complete when the harness profile artifacts satisfy `docs/harness-build-contract.md`, define a project-specific operating model with selected workflows, team structure, skills, memory expectations, and quality gates, and no application code has been changed.

## Pattern Selection

- Prefer the smallest team pattern that still gives adequate review and verification discipline.
- Use `docs/team-architecture-selection.md` as the decision guide, not intuition alone.
- Use a simple single-agent or producer-reviewer shape for small scoped work.
- Use pipeline, fan-out-fan-in, or hierarchical delegation only when the project or task shape clearly requires it.
- Record why the selected pattern fits this repository and what would trigger a different pattern later.

## Memory Setup

- Use `docs/memory-model.md` to decide what belongs in project memory and what belongs only at goal level.
- Use `docs/memory-safety.md` before recording any memory entry.
- Define what the project should remember before planning: facts, decisions, known risks, root causes, reusable commands, constraints, and hazards.
- Define what should be remembered after shipping: durable lessons, root causes, and recurring verification guidance.
- Keep memory sanitized. Never persist secrets, tokens, customer data, or private business data.

## Skill Selection

- Use `docs/skill-system.md` to select the smallest sufficient set of core skills and skill packs.
- Use `skills/SKILL_AUTHORING_RULES.md` if a real recurring capability gap appears.
- Do not invent a new skill for one project or one task unless the gap is recurring and distinct.
- Record why each selected skill or pack belongs in the project harness profile.

## Stop Conditions

- the six harness profile artifacts exist
- selected workflow, team pattern, skills, gates, and memory rules are explicit
- assumptions and unknowns are documented
- no application code has been implemented

## Failure Modes

- producing generic profile files with no project-specific choices
- selecting too many skills or patterns without justification
- mixing harness design with feature implementation
- storing sensitive or private data in memory-oriented artifacts
- leaving approval needs implicit

## Human Approval

Ask for approval if the proposed harness profile changes expected team structure, review policy, verification burden, memory retention, or any project rule that affects human ownership or risk acceptance.
