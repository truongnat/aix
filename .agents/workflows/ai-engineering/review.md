---
description: ai-engineering review workflow focused on correctness, risk, and release readiness
---
# Workflow: ai-engineering-review
Schema: agentic-sdlc.workflow@v1
Domain: ai-engineering
MaxCpuMs: 180000
MaxWallTimeMs: 600000
MaxNetworkCalls: 20

## Step: review_context
Skill: agent.llm_subagent
Input: ai-engineering/reviewer:::Summarize current diff intent, architecture impact, and likely weak spots.

## Step: specification_gate
Skill: ai-engineering.acceptance_guard
DependsOn: review_context
Input: {{review_context}}

## Step: review_risk_register
Skill: ai-engineering.risk_register
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
Input: ai-engineering/reviewer:::Return merge recommendation with blocking issues from:
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
Input: Require human merge approval after review quality and simulation gates.

## Step: finalize
Skill: demo.echo
DependsOn: manual_approval_gate
Input: Review workflow ready for domain ai-engineering with report-quality, simulation-fallback, and manual-approval gates.
