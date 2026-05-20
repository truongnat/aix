---
description: merge workflow
---

# Workflow: merge
Schema: agentic-sdlc.workflow@v1
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

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: summarize
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: internet_security_check
Input: Build detailed workflow report from:
{{merge_branch}}
{{analyze_conflicts}}
{{resolve_conflicts}}
{{validate_merge}}
{{commit_merge}}
{{summarize}}
{{internet_security_check}}
Return strict JSON with summary/actions/risks.

## Step: report_quality_gate
Skill: agent.report_quality_gate
DependsOn: workflow_report
Input: {{workflow_report}}

## Step: next_actions
Skill: agent.next_steps
DependsOn: report_quality_gate
Input: Derive next actions from {{workflow_report}} and prioritize merge blockers and conflict follow-ups.

## Step: finalize
Skill: demo.echo
DependsOn: next_actions
Input: Merge workflow completed with report-quality gate.
