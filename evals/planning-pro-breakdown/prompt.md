---
schema_version: "1.1"
name: planning-pro-breakdown
description: Planning request should produce verifiable task breakdown
tags: [spine]
runs: 2
max_turns: 10
allowed_tools: [Skill, Read, Glob, Grep, Write]
expected_outcome: planning-pro used; plan with tasks and acceptance criteria produced
---
We agreed the notes sync feature needs: a local SQLite layer, an outbox table,
and a last-write-wins merge. Turn that into an implementation plan I can execute
step by step.
