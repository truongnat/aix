# Skill System

## Purpose

This document explains how skills fit into the Harness Design System and how they should be selected, maintained, and extended.

## What A Skill Is

A skill is a reusable capability contract. It tells an agent when the capability applies, how to execute it, what boundaries to respect, and what output quality is required.

## What A Skill Is Not

A skill is not:

- a random markdown note
- a giant pasted reference doc
- a replacement for commands or workflows
- a dumping ground for one-off project detail

## Skill Types

### Core Skill

Core skills support mandatory behavior across many projects, such as planning, verification, review, and memory discipline.

### Skill Pack

Skill packs are routing aids. They help an agent choose a relevant domain starting point without replacing core skills.

### Future Domain Skill

A future domain skill is a narrowly justified deep capability for a recurring domain need. It should only be added when a core skill or pack is not enough.

## How Initial Harness Setup Should Select Skills

Initial harness setup should select the smallest sufficient set of core skills and skill packs for the host repository.

It should:

- start from core skills
- add one or more skill packs when domain routing is needed
- avoid inventing a new skill unless the gap is recurring and distinct
- record the reason for each selected skill or pack in `.harness/SKILLS.md`

## How Skills Relate To Other System Layers

- Commands tell the agent what phase action to take.
- Workflows tell the agent how to move through common work types.
- Team patterns shape collaboration.
- Memory gives reusable context that skills should respect.
- Quality gates define the evidence standard that skill outputs must support.

Skills should strengthen these layers, not compete with them.

## Why Skills Must Stay Compact

Compact skills are easier to select, read, maintain, and reuse. Long skills tend to blur boundaries, duplicate docs, and create catalog bloat.

## Add A New Skill Or Update An Existing One

Update an existing skill when:

- the capability already exists
- the boundary is mostly correct
- the improvement is refinement rather than a new distinct contract

Add a new skill when:

- the need is recurring
- the capability is distinct
- the boundary is clear
- the capability will improve future harness profiles, not just one task

## Avoiding Skill Catalog Bloat

- prefer updating before adding
- prefer packs for routing before deep domain skills
- avoid one-off skills
- avoid overlapping skills with fuzzy boundaries
- require each new skill to justify its lasting place in the system
