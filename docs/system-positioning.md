# System Positioning

## Purpose

This document defines the major system layers in `ai-engineering-harness` so future additions stay aligned with [TARGET.md](../TARGET.md).

## Skill Library

- Purpose: give agents reusable capability units with explicit boundaries.
- What lives there: core skills, future narrowly justified deep skills, and small routing aids such as skill packs.
- What it must not become: a giant undifferentiated catalog of prompts or a dumping ground for every domain idea.

## Memory Model

- Purpose: give agents durable context that survives beyond a single prompt or session.
- What lives there: project facts, decisions, root causes, reusable commands, and sanitized lessons worth recalling before planning.
- What it must not become: a secret store, a raw activity log, or a database-backed memory service.

## Workflow System

- Purpose: give agents repeatable process for common engineering work.
- What lives there: feature, bugfix, refactor, review, and incident workflows plus goal and task lifecycle guidance.
- What it must not become: a rigid orchestration engine or a substitute for project judgment.

## Team Architecture Patterns

- Purpose: give agents collaboration structure for multi-step or multi-role work.
- What lives there: delegation patterns, reviewer structure, supervision flow, and project-specific team shape guidance.
- What it must not become: a runtime scheduler, agent swarm platform, or background-worker system.

## Harness Profile

- Purpose: define the project-specific operating context an agent should use inside a host repository.
- What lives there: selected workflow, selected team pattern, selected skills, quality gates, memory expectations, and host-repo operating rules.
- What it must not become: generated application code or a framework-level runtime contract.

## Quality Gates

- Purpose: force evidence discipline at each phase of work.
- What lives there: entry criteria, required evidence, completion criteria, and stop conditions for phases and artifacts.
- What it must not become: box-checking without evidence or a fake pass/fail layer disconnected from actual work.

## Host Repository Artifacts

- Purpose: persist the harness profile and work artifacts where the host project can review and reuse them.
- What lives there: `.harness/` profile files, goal artifacts, plans, verification notes, and remembered lessons.
- What it must not become: a place for secrets, customer data, tokens, or private business data.
