---
schema_version: "1.1"
name: code-review-pro-gate
description: Review request on a diff should invoke code-review-pro
tags: [spine, review]
runs: 2
max_turns: 10
allowed_tools: [Skill, Read, Glob, Grep, Bash]
expected_outcome: code-review-pro used; findings or clean verdict reported
---
Review the current uncommitted changes in this repo for correctness and security
issues before I merge them.
