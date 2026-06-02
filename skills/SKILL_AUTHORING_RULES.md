# Skill Authoring Rules

## Purpose

These rules define the mandatory shape for creating or editing skills in `ai-engineering-harness`.

Use this document to keep skills reusable, bounded, and consistent with the Harness Design System.

## Formula

`Skill = Metadata + Contract + Decision + Knowledge + Execution + Quality`

## Metadata

Every skill should identify:

- name
- short description
- domain
- level
- related commands, workflows, or packs

Metadata should help an agent decide quickly whether the skill fits the task.

## Contract

Every skill should define:

- purpose
- when to use
- when not to use
- required inputs
- expected outputs
- boundary

The contract is the minimum promise the skill makes. If the boundary is unclear, the skill is not ready.

## Decision

Every skill should include:

- defaults
- decision rules
- tradeoffs
- anti-patterns
- escalation rules

Skills should help the agent make better choices, not just follow a checklist.

## Knowledge

Every skill should provide:

- concise practical reference
- examples and caveats
- optional references folder later if justified

Do not paste giant documentation blobs into a skill. Keep only the knowledge needed to execute the capability correctly.

## Execution

Every skill should define:

- workflow
- operating principles
- output format
- handoff rules

Execution guidance should be repeatable, practical, and artifact-aware.

## Quality

Every skill should include:

- checklist before done
- verification expectations
- safety checks
- residual risk reporting

A skill is incomplete if it cannot say what “good enough” means.

## Authoring Rules

- Check existing skills and packs before creating a new skill.
- Prefer updating an existing skill if the need is already covered.
- Add a new skill only when the need is recurring and distinct.
- Keep skills compact and reusable.
- Preserve required headings for validated skills.
- Do not turn skills into long general essays.
- Do not hide runtime assumptions inside the skill.

## Anti-Bloat Rule

This repository should not become a large skill dump. A new skill needs a clear long-term role inside project-specific harness design, not just one temporary use case.
