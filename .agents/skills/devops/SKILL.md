---
name: "DevOps Domain Skill"
description: "Route CI, deployment, and infra changes toward environment-aware checks."
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

## Checklist Before Done

- do not claim success without environment-specific validation
- do not store secrets or access details in generated artifacts
