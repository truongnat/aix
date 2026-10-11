---
schema_version: "1.1"
name: ttd-pro-red
description: Implementation request should drive failing test first
tags: [spine, tdd]
runs: 2
max_turns: 12
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
expected_outcome: ttd-pro used; a failing test exists before implementation
---
Implement a `mergeNotes(local, remote)` function that resolves conflicts using
last-write-wins on the `updatedAt` field. Use test-driven development.
