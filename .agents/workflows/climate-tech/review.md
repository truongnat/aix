---
description: climate-tech review workflow focused on correctness, risk, and release readiness
---
# Workflow: climate-tech-review
Schema: agentic-sdlc.workflow@v1
Domain: climate-tech
MaxCpuMs: 180000
MaxWallTimeMs: 600000
MaxNetworkCalls: 20

## Step: review_context
Skill: agent.llm_subagent
Input: climate-tech/reviewer:::Summarize current diff intent, architecture impact, and likely weak spots.

## Step: specification_gate
Skill: climate-tech.acceptance_guard
DependsOn: review_context
Input: {{review_context}}

## Step: review_risk_register
Skill: climate-tech.risk_register
DependsOn: specification_gate
Input: {{specification_gate}}

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: review_risk_register
Input: Run security check on review artifacts for internet-enabled execution paths:
{{review_risk_register}}

## Step: review_decision
Skill: agent.llm_subagent
DependsOn: internet_security_check
Input: climate-tech/reviewer:::Return merge recommendation with blocking issues from:
{{internet_security_check}}

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: review_decision
Input: Build detailed review workflow report from:
{{review_context}}
{{specification_gate}}
{{review_risk_register}}
{{internet_security_check}}
{{review_decision}}
Return strict JSON with summary/actions/risks and merge posture.

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
Input: Review workflow ready for domain climate-tech with report-quality, simulation-fallback, and manual-approval gates.
