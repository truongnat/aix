---
description: release advanced workflow with deterministic gates and report quality guard
---
# Workflow: release
Schema: antigrav.workflow@v1
Domain: agent
MaxCpuMs: 240000
MaxWallTimeMs: 900000
MaxNetworkCalls: 30

## Step: intent_analysis
Skill: agent.llm_subagent
Input: Analyze task scope, constraints, and acceptance criteria for release. Return strict JSON with summary/actions/risks.

## Step: execution_plan
Skill: agent.llm_subagent
DependsOn: intent_analysis
Input: Build deterministic implementation plan for release with milestones, validation, and rollback notes.

## Step: validation_gate
Skill: agent.run_script
DependsOn: execution_plan
Retry: 1
OnFailure: FailFast
Input: echo "validate release"

## Step: risk_review
Skill: agent.llm_subagent
DependsOn: validation_gate
Input: Produce risk register for release, including severity, blast radius, and mitigations.

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

## Step: finalize
Skill: demo.echo
DependsOn: next_actions
Input: Advanced scaffold workflow release prepared with report-quality and simulation-fallback gates.
