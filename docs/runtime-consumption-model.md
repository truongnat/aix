# Runtime Consumption Model

## Purpose

Explain how the plugin-like capability pack should be consumed from inside common AI coding runtimes.

## What Runtime Consumption Means

Runtime consumption means an agent uses the installed or copied harness surface as operating context while working inside a target repository.

It does not mean compiled plugin integration or runtime adapters.

## Source Pack vs Target Repo vs Runtime

- source pack: this repository, which is the canonical source
- target repo: the actual product repository where work happens
- runtime: the agent tool that reads the installed pack surface and `.harness/` artifacts

The runtime should use the installed harness surface from the target repo, not treat the source pack as the product work tree.

## Recommended Current Flow

1. use this repository as the canonical source pack
2. install or copy the operating surface into the target repo
3. create `.harness/` profile artifacts in the target repo
4. create goal artifacts in the target repo when needed
5. validate target profile or goal artifacts there
6. let the runtime operate against the target-repo artifacts

## What The Agent Should Read

Inside the target repository, the agent should read:

- `AGENTS.md`
- installed commands, skills, workflows, patterns, and templates as needed
- `.harness/` profile artifacts
- `.harness/goals/<goal-id>/` artifacts when active

## What The Agent Should Not Do

- do not treat the source pack repo as the product work repo
- do not invent runtime adapter behavior
- do not store product state in the source pack instead of the target repo
- do not assume validation proves application correctness

## Validation Flow

Use validation in the target repository:

- `node validate.js --target ../my-project --profile-only`
- `node validate.js --target ../my-project --goal <goal-id>`

Validation remains structural-only.

## Safety Boundaries

- keep markdown as the source of truth
- keep `.harness/` artifacts in the target repo
- keep runtime guidance docs-only
- do not add adapter, plugin, or marketplace behavior under the name of runtime support

## Relationship To Plugin Model

The runtime consumption model is the runtime-facing expression of the plugin model.

The plugin model explains what the pack is. Runtime consumption explains how an agent should use that pack inside a target repository today.

## Frozen Runtime Contract

v1.0.0-stable runtime consumption is recorded in [frozen-runtime-consumption-contract.md](frozen-runtime-consumption-contract.md).
