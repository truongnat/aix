# .agents Package Guide

This folder is the deterministic package root for workflows, skills, roles, rules, templates, and runtime state used by `agentic-sdlc`.

## Structure

- `workflows/`: executable workflow definitions (`.md` only)
- `skills/`: skill definitions (`SKILL.md` per skill folder)
- `roles/`: role prompts for `agent.llm_subagent`
- `rules/`: runtime/project policy rules
- `templates/`: reusable prompt templates for workflow entry points
- `state/`: persisted workflow snapshots and thread session state
- `memory/`: vector/graph context indexes

## Security Contract

Workflows that use internet-capable skills must include a security gate step.

Recommended standard:

- Step ID: `internet_security_check`
- Skill: `cybersecurity.security_scan_guard`

This contract is enforced by `cargo run -- workflow check`.

## Validation

```bash
cargo run -- workflow check
cargo run -- workflow quality-skills --strict
```

## Entry Docs

- Runtime/project docs: `README.md` (repository root)
- Gemini-focused package contract: `.agents/GEMINI.md`
