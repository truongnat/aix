---
description: climate-tech bugfix workflow with root-cause and regression guard
---
# Workflow: climate-tech-bugfix
Schema: antigrav.workflow@v1
Domain: climate-tech
MaxCpuMs: 220000
MaxWallTimeMs: 900000

## Step: incident_triage
Skill: agent.llm_subagent
Input: climate-tech/resolver:::Diagnose failure mode and likely root cause. Prioritize deterministic repro.

## Step: blast_radius
Skill: climate-tech.impact_analyzer
DependsOn: incident_triage
Input: {{incident_triage}}

## Step: patch_plan
Skill: agent.llm_subagent
DependsOn: blast_radius
Input: climate-tech/implementer:::Propose minimal patch and rollback strategy from:
{{blast_radius}}

## Step: regression_guard
Skill: climate-tech.acceptance_guard
DependsOn: patch_plan
Retry: 1
Input: {{patch_plan}}

## Step: postmortem
Skill: climate-tech.risk_register
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
Input: Bugfix workflow ready for domain climate-tech with report-quality gate.
