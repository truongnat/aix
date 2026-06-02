# Harness Build Usage Guide

This guide explains how to use `harness-build` manually with an AI coding agent inside a real host repository.

## What `harness-build` Does

- reads the repository contract and relevant project docs before implementation work
- selects a harness profile shape for the host repository
- produces project-specific `.harness/` operating artifacts
- stops before application code changes

## What `harness-build` Does Not Do

- it does not implement features or bug fixes
- it does not add runtime code, services, dependencies, or infrastructure
- it does not replace human review or approval
- it does not store secrets or private business data in memory artifacts

## Prerequisites

- the host repository has `TARGET.md` and `AGENTS.md`
- the harness files have been copied into the host repository
- the agent can read repository markdown files and write `.harness/` artifacts
- a human reviewer is available to approve the generated harness profile

## Recommended Read Order

1. `TARGET.md`
2. `AGENTS.md`
3. `commands/harness-build.md`
4. `docs/system-positioning.md`
5. `docs/team-architecture-selection.md`
6. `docs/memory-model.md`
7. `docs/memory-safety.md`
8. `docs/sdlc-execution-model.md`
9. `docs/harness-build-contract.md`
10. `docs/skill-system.md`

## First Prompt

Recommended first prompt:

> “Read TARGET.md, AGENTS.md, commands/harness-build.md, docs/system-positioning.md, docs/team-architecture-selection.md, docs/memory-model.md, docs/memory-safety.md, and docs/sdlc-execution-model.md. Then run harness-build for this repository. Produce .harness/HARNESS.md, TEAM.md, SKILLS.md, WORKFLOW.md, GATES.md, and MEMORY.md. Do not implement application code.”

## Follow-Up Prompts

Use short follow-ups after the first draft:

- `Explain why you selected this team pattern over the simpler alternatives.`
- `Tighten the selected skills to the smallest sufficient set for this repository.`
- `List every assumption and unknown that still needs human review.`
- `Revise the gates so they match this repository's actual risk level and delivery model.`
- `Re-check MEMORY.md for anything that could capture secrets, customer data, or private business data.`

## Expected Output Artifacts

`harness-build` should create:

- `.harness/HARNESS.md`
- `.harness/TEAM.md`
- `.harness/SKILLS.md`
- `.harness/WORKFLOW.md`
- `.harness/GATES.md`
- `.harness/MEMORY.md`

## Review Checklist

Review the generated profile before using it:

- each artifact makes project-specific choices instead of generic filler
- the selected team pattern matches the repository size, risk, and collaboration shape
- the selected skills are minimal and justified
- the workflow is explicit and stops drift before implementation
- the quality gates are evidence-based and realistic
- memory rules are useful, durable, and sanitized

For a full review pass, use [docs/harness-build-review-checklist.md](harness-build-review-checklist.md).

## Common Mistakes

- starting from `harness-run` instead of building the harness profile first
- producing generic `.harness/` files with no repository-specific reasoning
- selecting too many skills, packs, or team roles
- mixing harness-profile work with feature implementation
- writing memory rules that could capture secrets or private business context
- skipping human review for approval-sensitive choices

## Safety Notes

- keep markdown as the source of truth
- do not store credentials, tokens, `.env` values, customer data, or private business data
- ask for approval when changing review burden, team structure, or verification expectations
- stop if the repository contract conflicts with the proposed harness profile

## After `harness-build`: Validate The Target Repo Profile

After the profile exists, review the adopted host repository structure with:

- [docs/target-repo-validation.md](target-repo-validation.md)
- [docs/target-repo-validation-checklist.md](target-repo-validation-checklist.md)
- [docs/target-repo-validation-prompts.md](target-repo-validation-prompts.md)

Recommended validation flow:

- run `node validate.js --target ../my-project --profile-only` after creating the profile artifacts
- run `node validate.js --target ../my-project --goal <goal-id>` after creating a goal artifact set under `.harness/goals/<goal-id>/`

Minimal reference output:

- [examples/tiny-repo-adoption/](../examples/tiny-repo-adoption/)

When `harness-build` is used on a tiny repository, prefer the small memory convention first:

- [docs/small-repo-memory.md](small-repo-memory.md)

## How To Proceed After `harness-build`

1. Review the output with [docs/harness-build-review-checklist.md](harness-build-review-checklist.md).
2. Approve or revise the profile until the operating model is explicit.
3. Start active work with `commands/harness-start.md`.
4. Move through the command loop: map, start, discuss, plan, run, verify, ship, remember.
