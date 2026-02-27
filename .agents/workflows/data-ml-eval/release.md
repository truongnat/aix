---
description: data-ml-eval release workflow with quality signal and risk approval
---
# Workflow: data-ml-eval-release
Schema: antigrav.workflow@v1
Domain: data-ml-eval
MaxCpuMs: 180000
MaxWallTimeMs: 480000

## Step: release_scope
Skill: agent.llm_subagent
Input: data-ml-eval/releaser:::Build release scope summary, included features, and customer impact.

## Step: release_quality_signal
Skill: data-ml-eval.acceptance_guard
DependsOn: release_scope
Input: {{release_scope}}

## Step: release_risk
Skill: data-ml-eval.risk_register
DependsOn: release_quality_signal
Input: {{release_quality_signal}}

## Step: finalize_release_note
Skill: agent.llm_subagent
DependsOn: release_risk
Input: data-ml-eval/releaser:::Generate final release note and go/no-go recommendation from:
{{release_risk}}

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: finalize_release_note
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

