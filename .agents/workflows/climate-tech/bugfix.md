---
description: climate-tech bugfix workflow with root-cause and regression guard
---
# Workflow: climate-tech-bugfix
Schema: antigrav.workflow@v1
Domain: climate-tech
MaxCpuMs: 180000
MaxWallTimeMs: 600000

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
OnFailure: Continue
Input: {{regression_guard}}

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: postmortem
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

