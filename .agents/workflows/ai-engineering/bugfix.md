---
description: ai-engineering bugfix workflow with root-cause and regression guard
---
# Workflow: ai-engineering-bugfix
Schema: antigrav.workflow@v1
Domain: ai-engineering
MaxCpuMs: 180000
MaxWallTimeMs: 600000

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
OnFailure: Continue
Input: {{regression_guard}}

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: postmortem
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

