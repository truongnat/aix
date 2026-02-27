---
description: cybersecurity release workflow with quality signal and risk approval
---
# Workflow: cybersecurity-release
Schema: antigrav.workflow@v1
Domain: cybersecurity
MaxCpuMs: 180000
MaxWallTimeMs: 480000

## Step: release_scope
Skill: agent.llm_subagent
Input: cybersecurity/releaser:::Build release scope summary, included features, and customer impact.

## Step: release_quality_signal
Skill: cybersecurity.acceptance_guard
DependsOn: release_scope
Input: {{release_scope}}

## Step: release_risk
Skill: cybersecurity.risk_register
DependsOn: release_quality_signal
Input: {{release_quality_signal}}

## Step: finalize_release_note
Skill: agent.llm_subagent
DependsOn: release_risk
Input: cybersecurity/releaser:::Generate final release note and go/no-go recommendation from:
{{release_risk}}
