---
description: refactor workflow
---

# Workflow: refactor
Schema: agentic-sdlc.workflow@v1
Domain: agent

## Step: ensure_branch
Skill: agent.ensure_branch
Input: refactor-thread

## Step: analyze_code
Skill: agent.semantic_search
DependsOn: ensure_branch
Input: 5:::code smell hotspots and maintainability risks

## Step: propose_refactor
Skill: agent.llm_subagent
DependsOn: analyze_code
Input: architect:::Propose refactor plan with no API changes unless explicitly required.

## Step: implement_refactor
Skill: agent.llm_subagent
DependsOn: propose_refactor
Input: implementer:::Apply refactor plan with behavior-preserving edits.

## Step: full_tests
Skill: agent.run_script
DependsOn: implement_refactor
Input: cargo test

## Step: commit_refactor
Skill: agent.git_commit
DependsOn: full_tests
Input:
refactor(core): improve structure without API changes

- plan generated
- refactor applied
- full tests passed

## Step: summarize
Skill: demo.echo
DependsOn: commit_refactor
Input: Refactor workflow completed.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: summarize
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: internet_security_check
Input: Build detailed workflow report from:
{{ensure_branch}}
{{analyze_code}}
{{propose_refactor}}
{{implement_refactor}}
{{full_tests}}
{{commit_refactor}}
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
Input: Derive next actions from {{workflow_report}} and prioritize unresolved refactor risks.

## Step: finalize
Skill: demo.echo
DependsOn: next_actions
Input: Refactor workflow completed with report-quality gate.
