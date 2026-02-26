---
description: merge workflow
---

# Workflow: merge
Schema: antigrav.workflow@v1
Domain: agent

## Step: merge_branch
Skill: agent.git_merge_branch
OnFailure: Continue
Input: main

## Step: analyze_conflicts
Skill: agent.analyze_conflicts
DependsOn: merge_branch
Input: scan

## Step: resolve_conflicts
Skill: agent.llm_subagent
DependsOn: analyze_conflicts
Input: resolver:::If conflicts exist, propose deterministic conflict resolution steps.

## Step: validate_merge
Skill: agent.run_script
DependsOn: resolve_conflicts
Input: cargo test

## Step: commit_merge
Skill: agent.git_commit
DependsOn: validate_merge
Input:
chore(merge): complete merge workflow

- merge attempted
- conflicts analyzed
- validation executed

## Step: summarize
Skill: demo.echo
DependsOn: commit_merge
Input: Merge workflow completed.
