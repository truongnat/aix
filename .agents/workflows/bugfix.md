---
description: bugfix workflow
---

# Workflow: bugfix
Schema: antigrav.workflow@v1
Domain: agent

## Step: ensure_branch
Skill: agent.ensure_branch
Input: bugfix-thread

## Step: detect_failure
Skill: agent.run_script
DependsOn: ensure_branch
Retry: 1
OnFailure: Continue
Input: cargo test

## Step: retrieve_context
Skill: agent.semantic_search
DependsOn: detect_failure
Input: 5:::failing test stack trace and related modules

## Step: generate_fix
Skill: agent.llm_subagent
DependsOn: retrieve_context
Input: implementer:::Fix only the reported bug. Do not add new features or broad refactors.

## Step: rerun_tests
Skill: agent.run_script
DependsOn: generate_fix
Retry: 2
Input: cargo test

## Step: commit_fix
Skill: agent.git_commit
DependsOn: rerun_tests
Input:
fix(bugfix): resolve failing behavior

- bug scoped and fixed
- tests rerun with retries

## Step: summarize
Skill: demo.echo
DependsOn: commit_fix
Input: Bugfix workflow completed.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: summarize
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

