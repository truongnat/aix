# Consumption Modes

## Purpose

Document the practical ways users can consume `ai-engineering-harness` as a plugin-like capability pack instead of treating this repository as a normal product repo.

## Recommended Current Mode

Recommended current mode:

- use this repository as the canonical source
- install or copy the operating surface into a target repository
- create `.harness/` profile artifacts in the target repository
- validate profile and goal artifacts there

This is the clearest, most supported mode today.

## Mode 1: Install/Copy Into Target Repo

### When To Use

Use this when:

- adopting the harness for the first time
- working in a small or medium repository
- you want the most direct supported path

### How It Works

- clone the source pack
- run `install.js` against the target repository
- create `.harness/` profile and goal artifacts there
- validate the target repository in place

### Pros

- simplest current workflow
- matches current docs and installer behavior
- easiest path to structural validation

### Cons

- copies files into the target repo
- updates require explicit re-copy or re-install

### Current Status

Recommended and supported now.

## Mode 2: Vendored Harness Directory

### When To Use

Use this when:

- the target repo wants to keep the harness under a dedicated internal directory
- the team prefers explicit vendoring over repeated install runs

### How It Works

- vendor the selected harness surface into the target repository
- point agents at that vendored operating surface
- keep `.harness/` artifacts in the target repository

### Pros

- clearer ownership inside the target repo
- easier to review harness updates as repo changes

### Cons

- requires the team to define a stable vendoring convention
- current docs are less detailed for this mode than for install/copy

### Current Status

Supported conceptually, but less documented than install/copy.

## Mode 3: Global Agent Capability Folder

### When To Use

Use this when:

- an agent runtime supports a shared capability folder
- one user wants the same pack available across many repositories

### How It Works

- keep the harness pack in a global capability location
- let the agent read it there
- still create `.harness/` profile and goal artifacts inside each target repository

### Pros

- reduces repeated copying for one user
- keeps the source pack centralized

### Cons

- depends on runtime-specific agent setup
- easier to create drift between global pack state and target-repo expectations

### Current Status

Allowed as a future-friendly usage pattern, but not the primary documented mode yet.

## Mode 4: Release Archive

### When To Use

Use this when:

- users want a versioned snapshot without cloning the full source repo
- the source pack needs simpler distribution for manual adoption

### How It Works

- download a release archive of the pack
- extract the relevant installed surface
- copy or install it into the target repository

### Pros

- versioned distribution without runtime complexity
- easier for users who only need a snapshot

### Cons

- archive shape needs design discipline
- not yet a first-class documented release workflow

### Current Status

Planned as a later distribution-friendly mode, not yet fully designed.

## Mode 5: Future Plugin Registry

### When To Use

Use this only if a future plugin or registry distribution channel exists.

### How It Works

- a runtime or registry would distribute the pack as a plugin-like capability bundle
- target repos would still consume only the operating surface they need

### Pros

- cleaner discovery and delivery
- stronger plugin-like mental model

### Cons

- risks distribution complexity
- can drift toward marketplace automation too early

### Current Status

Explicitly future-only. Not implemented.

## Choosing A Mode

Choose by current needs:

- use install/copy for the default supported path
- use vendoring when a target repo wants explicit in-repo ownership
- use a global capability folder only when a runtime already supports that cleanly
- treat release archive and plugin registry as future distribution channels

## Safety Boundaries

- keep markdown as the source of truth
- keep `.harness/` artifacts in the target repository
- avoid adding runtime adapters or distribution automation in the name of convenience
- validate target profile and goal artifacts where product work happens

## What Not To Do

- do not treat this source repository as the user's application repo
- do not copy the full source repository blindly into target repos
- do not assume a future plugin registry exists today
- do not move product work back into the source pack
