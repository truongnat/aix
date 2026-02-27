---
description: cybersecurity bugfix workflow with root-cause and regression guard
---
# Workflow: cybersecurity-bugfix
Schema: antigrav.workflow@v1
Domain: cybersecurity
MaxCpuMs: 180000
MaxWallTimeMs: 600000

## Step: incident_triage
Skill: agent.llm_subagent
Input: cybersecurity/resolver:::Diagnose failure mode and likely root cause. Prioritize deterministic repro.

## Step: blast_radius
Skill: cybersecurity.impact_analyzer
DependsOn: incident_triage
Input: {{incident_triage}}

## Step: patch_plan
Skill: agent.llm_subagent
DependsOn: blast_radius
Input: cybersecurity/implementer:::Propose minimal patch and rollback strategy from:
{{blast_radius}}

## Step: regression_guard
Skill: cybersecurity.acceptance_guard
DependsOn: patch_plan
Retry: 1
Input: {{patch_plan}}

## Step: postmortem
Skill: cybersecurity.risk_register
DependsOn: regression_guard
OnFailure: Continue
Input: {{regression_guard}}
