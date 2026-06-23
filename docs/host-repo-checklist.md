# Host Repo Checklist

Use this checklist when adopting `ai-engineering-harness` in another repository.

## Repository Setup

- [ ] Copy `AGENTS.md`
- [ ] Copy `commands/`
- [ ] Copy `skills/`
- [ ] Copy `workflows/`
- [ ] Copy `patterns/`
- [ ] Copy `templates/`
- [ ] Copy the selected adoption-facing docs
- [ ] Create `.harness/`

## Initial `.harness/` State

- [ ] Create `.harness/PROJECT.md`
- [ ] Create `.harness/GOAL.md` for the first task
- [ ] Create `.harness/STATE.md`
- [ ] Create `.harness/PLAN.md` before implementation

## Team Usage

- [ ] Confirm agents read artifacts before touching code
- [ ] Confirm planning happens before implementation
- [ ] Confirm verification notes are written before completion claims
- [ ] Confirm durable lessons go into `.harness/REMEMBER.md`

## Commit Policy

- [ ] Decide which `.harness/` artifacts should be shared in git
- [ ] Keep `.harness/*.local.md` local-only
- [ ] Avoid committing transient scratch notes

## Safety Rules

- [ ] Do not store credentials
- [ ] Do not store tokens or API keys
- [ ] Do not store customer data
- [ ] Do not store private business data
- [ ] Sanitize memory artifacts before commit

## Validation

- [ ] Run `node bin/validate.js`
- [ ] Review `AGENTS.md` for repository-specific adjustments if needed
- [ ] Confirm the first real task can move through `Session Start -> Discuss -> Plan -> Run -> Verify -> Ship -> Remember`
- [ ] Treat `Map` as a compatibility/manual context-refresh command, not part of the default loop
