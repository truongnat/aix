# TARGET

## One-Line Target

`ai-engineering-harness` is a plugin-like markdown capability pack for AI coding agents that helps them load engineering discipline into an existing repository or agent runtime.

## Why This Exists

AI coding agents often fail because they lose project context, guess instead of reading artifacts, code before planning, skip verification, forget previous fixes, lack a repeatable SDLC loop, lack project-specific team architecture, and lack durable memory.

This project exists to make those failure modes harder to repeat. The harness should force the agent to read, plan, verify, remember, and operate inside a project-specific engineering system instead of improvising from a single prompt.

## What This Project Must Become

This project must evolve from a generic markdown instruction kit into a reusable harness capability pack.

It must help an agent go from:

`repo/task input`

to:

- project-specific harness profile
- selected workflow
- selected team architecture pattern
- selected skill packs and core skills
- memory model
- SDLC execution model
- quality gates
- goal/task artifacts

The canonical source lives in this repository, but the intended product is not “clone this repo and do product work inside it.”

The intended product is a reusable pack that can be installed, copied, vendored, or otherwise consumed by an existing AI coding workflow.

## Core Philosophy

- Skills give agents capability.
- Memory gives agents context.
- Workflows give agents process.
- Team patterns give agents collaboration structure.
- Quality gates give agents evidence discipline.
- Harness profiles give agents project-specific operating context.
- Markdown remains the source of truth.

## Distribution Philosophy

- the canonical source lives in this repository
- users should consume it as a capability pack
- adoption can happen by copy, install script, vendoring, release archive, or a future plugin registry
- target repositories should receive only the operating surface they need
- the harness should feel like a superpower pack for AI engineering

## Install UX Target

`ai-engineering-harness` must be installable as a **plugin-like capability pack** without requiring consumers to manually clone this repository.

Desired consumer flow:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh
```

Manual clone and `node install.js --target <repo>` remain supported for **maintainers**, not as the only adoption path.

**`v0.9.1` (experimental):** runtime-native install via `install.sh --runtime <name> --scope project --init-harness` — [plugin-install-ux.md](docs/plugin-install-ux.md), [v0.9.1-release-notes.md](docs/v0.9.1-release-notes.md). Manual root copy remains fallback. Plan history: [v0.9.0-plan.md](docs/v0.9.0-plan.md).

## Source Inspirations

| Source | What To Learn From It |
|---|---|
| `truongnat/skills` | skill authoring discipline, skill contracts, boundaries, quality gates, reusable expert behavior |
| `truongnat/dev-memory` | memory model, recall-before-planning, remember-after-shipping, project facts, decisions, root causes, reusable commands |
| `truongnat/agentic-sdlc` | SDLC execution loop, goal/task lifecycle, review and retry loop, state/checkpoint thinking |
| `revfactory/harness` | team architecture factory, pattern selection, project-specific agent/team design |
| `obra/superpowers` | mandatory methodology chain, planning before coding, TDD/review discipline, composable skills |
| `open-gsd/gsd-core` | context engineering, durable artifacts, command loop, phase-based planning, fresh-context execution mindset |

## Current State

`v0.1.0` provides:

- `AGENTS.md`
- command loop
- core skills
- workflows
- patterns
- templates
- adoption docs
- runtime usage docs
- skill packs
- workflow scenarios
- quality gates matrix
- install and validate helpers

This is a clean markdown-first foundation, but it is still mainly a foundation. It does not yet deliver the full project-specific harness design target.

## Missing Capabilities

1. Harness Builder
2. Harness Profile Templates
3. Memory Model
4. SDLC Execution Model
5. Team Architecture Selection
6. Skill Authoring System
7. Demo Harness Build
8. Stronger validation around the new model

## v0.2.0 Target

`v0.2.0` must turn the foundation into a Harness Design System.

After `v0.2.0`, a user should be able to ask an agent:

“Build a harness profile for this project/task.”

And the agent should produce:

- `.harness/HARNESS.md`
- `.harness/TEAM.md`
- `.harness/SKILLS.md`
- `.harness/WORKFLOW.md`
- `.harness/GATES.md`
- `.harness/MEMORY.md`
- `.harness/goals/<goal-id>/GOAL.md`
- `.harness/goals/<goal-id>/PLAN.md`
- `.harness/goals/<goal-id>/TASKS.md`
- `.harness/goals/<goal-id>/VERIFY.md`
- `.harness/goals/<goal-id>/REMEMBER.md`

## Definition Of Done For v0.2.0

- `commands/harness-start.md` exists
- harness profile templates exist
- team architecture selection is documented
- memory model is documented
- SDLC execution model is documented
- skill system is documented
- workflow dogfood example exists
- README links the target architecture
- validate.js checks the new required files
- `node validate.js` passes
- `npm test` passes
- no runtime code is added
- no dependencies are added
- no `src/` directory is added

## Non-Goals

- no runtime framework
- no server
- no database
- no Docker platform
- no LangGraph
- no Redis/Neo4j/Meilisearch
- no background workers
- no heavy marketplace or package publishing automation yet
- no large skill catalog import
- no package publishing automation

Plugin-like consumption is a goal.

Marketplace packaging is a later optional distribution channel.

## Decision Rule

If a proposed change does not help the project move toward “project-specific harness design”, it should be postponed unless it fixes correctness, safety, validation, or adoption clarity.

## North Star Example

Input:

“Add Google login to a Flutter app while preserving guest mode.”

Expected harness output:

- choose Mobile + Backend/Auth relevant skills
- choose Producer-Reviewer or Pipeline pattern depending on scope
- create `HARNESS.md`
- create `TEAM.md`
- create `SKILLS.md`
- create `WORKFLOW.md`
- create `GATES.md`
- create `MEMORY.md`
- create goal artifacts under `.harness/goals/google-login/`
- define verification for guest flow, login flow, logout flow, token/session behavior, simulator/device checks
- remember durable lessons safely

## Maintenance Rule

Whenever roadmap direction is unclear, read this file before adding new features.
