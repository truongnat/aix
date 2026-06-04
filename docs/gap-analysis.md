# Gap Analysis

## Purpose

This document explains the gap between the current `v0.1.0` foundation and the original target defined in [TARGET.md](../TARGET.md).

`v0.1.0` established a clean markdown-first base: commands, skills, workflows, patterns, templates, adoption docs, examples, and validation. That foundation is useful, but it does not yet deliver project-specific harness design.

## Current Foundation

The repository already provides:

- an operating contract in `AGENTS.md`
- a command loop
- core reusable skills
- workflow and pattern guidance
- artifact templates
- adoption and runtime usage docs
- quality gates and examples
- lightweight install and validation helpers

This is enough to help an agent behave better. It is not yet enough to help an agent design a project-specific harness profile.

## Gap Against Source Inspirations

### `truongnat/skills`

Still missing:

- stronger skill authoring discipline
- clearer skill contracts
- sharper boundaries for when a skill should or should not be used
- quality gates for skill outputs
- reusable expert behavior design beyond the current compact skill set

### `truongnat/dev-memory`

Still missing:

- an explicit memory model
- recall-before-planning behavior as a first-class system rule
- remember-after-shipping behavior tied to durable artifacts
- structured project facts
- durable decision records
- root cause memory
- reusable command memory

### `truongnat/agentic-sdlc`

Still missing:

- a more explicit SDLC execution loop
- goal and task lifecycle design
- review and retry loop structure
- state and checkpoint thinking across longer work

### `revfactory/harness`

Still missing:

- team architecture factory thinking
- pattern selection tied to project shape
- project-specific agent and team design guidance

### `obra/superpowers`

Still missing:

- stronger mandatory methodology chain
- sharper planning-before-coding enforcement
- tighter TDD and review discipline
- more composable skill usage patterns

### `open-gsd/gsd-core`

Still missing:

- deeper context engineering
- more durable artifact design
- richer command loop depth
- phase-based planning structure
- a stronger fresh-context execution mindset

## What v0.2.0 Must Add

`v0.2.0` must begin closing these gaps by introducing the first project-specific harness design surfaces:

- a clearer harness-start and adoption flow
- harness profile templates
- system layer positioning
- clearer memory, workflow, and team design surfaces
- stronger validation around the new model

The result should be a repository that helps an agent produce a project-specific harness profile rather than only follow a generic operating guide.

## Conclusion

`v0.2.0` must close these gaps without adding a heavy runtime.
