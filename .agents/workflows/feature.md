---
description: feature delivery workflow
---

# Workflow: feature
Schema: antigrav.workflow@v1
Domain: agent

## Step: ensure_branch
Skill: agent.ensure_branch
Input: feature-thread

## Step: retrieve_memory
Skill: agent.semantic_search
DependsOn: ensure_branch
Input: 5:::feature request and related code context

## Step: plan_feature
Skill: agent.llm_subagent
DependsOn: retrieve_memory
Input: architect:::Create a deterministic implementation plan. Keep scope minimal and testable.

## Step: implement_feature
Skill: agent.llm_subagent
DependsOn: plan_feature
Input: implementer:::Generate concrete code edits and file write instructions.

## Step: run_validation
Skill: agent.run_script
DependsOn: implement_feature
Input: cargo test

## Step: commit_feature
Skill: agent.git_commit
DependsOn: run_validation
Input:
feat(feature): implement workflow-driven feature

- branch prepared
- implementation drafted
- validation executed

## Step: summarize
Skill: demo.echo
DependsOn: commit_feature
Input: Feature workflow completed.
