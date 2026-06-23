---
id: devops
name: DevOps Domain Skill
status: draft
scope: domain
version: 1
can_block: false
can_write: false
inputs:
  - pipeline or environment target
  - rollback expectations
  - secrets and blast radius constraints
outputs:
  - selected domain guidance
  - generated harness profile entries
tools:
  - harness-map
  - harness-discuss
  - harness-plan
  - harness-verify
---

# DevOps Domain Skill

## Purpose

Route CI, deployment, and infra changes toward environment-aware checks.

## When To Use

- CI/CD changes, deployment config, Dockerfiles, or infra work
- observability or environment-sensitive changes
- release automation or rollback-path updates

## When Not To Use

- feature code without deployment or infra implications
- documentation-only work

## Inputs

- pipeline or environment target
- rollback expectations
- secrets and blast radius constraints

## Workflow

- map the deployment path and affected environments
- run dry-run or config validation where possible
- verify the real consumer path, not just file syntax
- record rollback and health-check evidence

## Operating Principles

- Prefer the devops pack as the routing aid for this repository.
- Keep the generated surface small and reviewable.
- Do not generate a domain skill when the stack signal is weak or absent.

## Reasoning Procedure

- assume environment drift until proven otherwise
- treat rollout and rollback as part of correctness
- prefer narrow changes that do not widen blast radius

## Action Loop

- inspect the deployment or pipeline surface
- validate the exact runner or environment config
- check health and logs after applying the change
- document the fallback path before shipping

## Examples

- CI job tweak -> devops domain skill with pipeline validation
- Dockerfile change -> devops domain skill with build and smoke test

## Output Contract

- record selected infra domains in config and skills profile
- generate `.harness/skills/devops/` when selected

## Checklist Before Done

- do not claim success without environment-specific validation
- do not store secrets or access details in generated artifacts

## Common Failure Modes

- config-only optimism: pipeline passes syntax checks but deploy fails
  - Counter: exercise the consumer path or a dry-run equivalent
- missing rollback: change is not reversible in a hurry
  - Counter: write the rollback command or revert path down
