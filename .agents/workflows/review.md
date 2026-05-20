---
description: review advanced workflow with deterministic gates and report quality guard
---
# Workflow: review
Schema: agentic-sdlc.workflow@v1
Domain: agent
MaxCpuMs: 240000
MaxWallTimeMs: 900000
MaxNetworkCalls: 30

## Step: intent_analysis
Skill: agent.llm_subagent
Input: Analyze task scope, constraints, and acceptance criteria for review. Return strict JSON with summary/actions/risks.

## Step: execution_plan
Skill: agent.llm_subagent
DependsOn: intent_analysis
Input: Build deterministic implementation plan for review with milestones, validation, and rollback notes.

## Step: validation_gate
Skill: agent.run_script
DependsOn: execution_plan
Retry: 1
OnFailure: FailFast
Input: echo "validate review"

## Step: risk_review
Skill: agent.llm_subagent
DependsOn: validation_gate
Input: Produce risk register for review, including severity, blast radius, and mitigations.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: risk_review
Input: Run a focused security check for internet-capable execution paths and return pass/fail with mitigations.

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: internet_security_check
Input: Build detailed workflow report from:
{{intent_analysis}}
{{execution_plan}}
{{validation_gate}}
{{risk_review}}
{{internet_security_check}}
Return strict JSON with summary/actions/risks.

## Step: report_quality_gate
Skill: agent.report_quality_gate
DependsOn: workflow_report
Input: {{workflow_report}}

## Step: simulation_fallback_gate
Skill: agent.simulation_fallback_gate
DependsOn: report_quality_gate
Input: {{workflow_report}}

## Step: next_actions
Skill: agent.next_steps
DependsOn: simulation_fallback_gate
Input: Derive next actions from {{workflow_report}} with explicit critical-path ordering.

## Step: manual_approval_gate
Skill: agent.manual_approval
DependsOn: next_actions
Input: Require human approval before final go/no-go.

## Step: finalize
Skill: demo.echo
DependsOn: manual_approval_gate
Input: Advanced scaffold workflow review prepared with report-quality, simulation-fallback, and manual-approval gates.
