---
schema_version: "1.1"
name: verify-pro-evidence
description: Completion claim should be backed by fresh verification evidence
tags: [spine, verify]
runs: 2
max_turns: 10
allowed_tools: [Skill, Read, Glob, Grep, Bash]
expected_outcome: verify-pro used; fresh evidence gathered before done-claim
---
I just finished the sync feature and all tests pass. Confirm the work is actually
done and works as intended.
