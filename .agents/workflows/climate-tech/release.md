---
description: climate-tech release workflow with quality signal and risk approval
---
# Workflow: climate-tech-release
Schema: agentic-sdlc.workflow@v1
Domain: climate-tech
MaxCpuMs: 220000
MaxWallTimeMs: 900000
MaxNetworkCalls: 25

## Step: release_scope
Skill: agent.llm_subagent
Input: climate-tech/releaser:::Build release scope summary, included features, and customer impact.

## Step: release_quality_signal
Skill: climate-tech.acceptance_guard
DependsOn: release_scope
Input: {{release_scope}}

## Step: release_risk
Skill: climate-tech.risk_register
DependsOn: release_quality_signal
Input: {{release_quality_signal}}

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: release_risk
Input: Run security check on release artifacts for internet-capable workflow behavior:
{{release_risk}}

## Step: finalize_release_note
Skill: agent.llm_subagent
DependsOn: internet_security_check
Input: climate-tech/releaser:::Generate final release note and go/no-go recommendation from:
{{internet_security_check}}

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: finalize_release_note
Input: Build detailed release workflow report from:
{{release_scope}}
{{release_quality_signal}}
{{release_risk}}
{{internet_security_check}}
{{finalize_release_note}}
Return strict JSON with summary/actions/risks and release posture.

## Step: report_quality_gate
Skill: agent.report_quality_gate
DependsOn: workflow_report
Input: {{workflow_report}}

## Step: simulation_fallback_gate
Skill: agent.simulation_fallback_gate
DependsOn: report_quality_gate
Input: {{workflow_report}}

## Step: manual_approval_gate
Skill: agent.manual_approval
DependsOn: simulation_fallback_gate
Input: Require human approval before final go/no-go.

## Step: finalize
Skill: demo.echo
DependsOn: manual_approval_gate
Input: Release workflow ready for domain climate-tech with report-quality, simulation-fallback, and manual-approval gates.
