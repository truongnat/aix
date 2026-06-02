# Distribution Model

## Purpose

Explain how the harness source repository relates to the installed surface inside a target repository.

## Source Repository

This repository is the canonical source for:

- commands
- skills
- workflows
- patterns
- templates
- adoption and validation docs

It is the place where the capability pack is authored and versioned.

## Installed Surface

The installed surface is the subset copied or vendored into a target repository so an agent can use the harness there.

That surface should stay focused on the operating materials the target repository actually needs.

## Target Repository Artifacts

The target repository is where product work happens.

After install or copy, the target repository should contain:

- the adopted markdown operating surface
- `.harness/` profile artifacts
- `.harness/goals/<goal-id>/` artifacts when active goals exist

## Agent Runtime Consumption

Agents should consume the harness from within the target repository or from a configured capability location that points into the installed surface.

The runtime should use the harness as operating context, not as the application codebase itself.

## What Should Be Copied

Usually copy:

- `AGENTS.md`
- commands, skills, workflows, patterns, templates
- adoption-facing docs
- validation docs

Copy only the surface the target repository needs.

## What Should Not Be Copied

Avoid copying:

- unrelated maintenance-only repository files
- heavy release-management artifacts when they are not useful in the target repo
- runtime code, server code, or generated state

## Future Package Or Plugin Distribution

Later optional distribution may include:

- release archives
- package-style distribution
- plugin-registry distribution

Those are future delivery channels for the same markdown-first operating surface, not a shift toward runtime infrastructure.
