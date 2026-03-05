---
description: ai-engineering bugfix workflow with root-cause and regression guard
---
# Workflow: ai-engineering-bugfix
Schema: antigrav.workflow@v1
Domain: ai-engineering
MaxCpuMs: 220000
MaxWallTimeMs: 900000

## Step: incident_triage
Skill: agent.llm_subagent
Input: ai-engineering/resolver:::Diagnose failure mode and likely root cause. Prioritize deterministic repro.

## Step: blast_radius
Skill: ai-engineering.impact_analyzer
DependsOn: incident_triage
Input: {{incident_triage}}

## Step: patch_plan
Skill: agent.llm_subagent
DependsOn: blast_radius
Input: ai-engineering/implementer:::Propose minimal patch and rollback strategy from:
{{blast_radius}}

## Step: regression_guard
Skill: ai-engineering.acceptance_guard
DependsOn: patch_plan
Retry: 1
Input: {{patch_plan}}

## Step: postmortem
Skill: ai-engineering.risk_register
DependsOn: regression_guard
Input: {{regression_guard}}

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: postmortem
Input: Review postmortem output for internet-surface risks and mitigations:
{{postmortem}}

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: internet_security_check
Input: Build detailed bugfix workflow report from:
{{incident_triage}}
{{blast_radius}}
{{patch_plan}}
{{regression_guard}}
{{postmortem}}
{{internet_security_check}}
Return strict JSON with summary/actions/risks.

## Step: report_quality_gate
Skill: agent.report_quality_gate
DependsOn: workflow_report
Input: {{workflow_report}}

## Step: finalize
Skill: demo.echo
DependsOn: report_quality_gate
Input: Bugfix workflow ready for domain ai-engineering with report-quality gate.
