---
description: data-ml-eval feature delivery with impact analysis and acceptance gates
---
# Workflow: data-ml-eval-feature
Schema: agentic-sdlc.workflow@v1
Domain: data-ml-eval
MaxCpuMs: 240000
MaxWallTimeMs: 900000
MaxNetworkCalls: 35

## Step: intent_triage
Skill: agent.llm_subagent
Input: data-ml-eval/architect:::Clarify objective, scope boundaries, and measurable acceptance criteria for this feature.

## Step: impact_analysis
Skill: data-ml-eval.impact_analyzer
DependsOn: intent_triage
Retry: 1
Input: {{intent_triage}}

## Step: implementation_plan
Skill: agent.llm_subagent
DependsOn: impact_analysis
Input: data-ml-eval/implementer:::Create a deterministic implementation plan from this context:
{{impact_analysis}}

## Step: acceptance_gate
Skill: data-ml-eval.acceptance_guard
DependsOn: implementation_plan
Retry: 1
Input: {{implementation_plan}}

## Step: risk_register
Skill: data-ml-eval.risk_register
DependsOn: acceptance_gate
Input: {{acceptance_gate}}

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: risk_register
Input: Analyze this workflow output for internet-surface risks and required security mitigations:
{{risk_register}}

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: internet_security_check
Input: Build detailed feature workflow report from:
{{intent_triage}}
{{impact_analysis}}
{{implementation_plan}}
{{acceptance_gate}}
{{risk_register}}
{{internet_security_check}}
Return strict JSON with summary/actions/risks.

## Step: report_quality_gate
Skill: agent.report_quality_gate
DependsOn: workflow_report
Input: {{workflow_report}}

## Step: finalize
Skill: demo.echo
DependsOn: report_quality_gate
Input: Feature workflow ready for domain data-ml-eval with report-quality gate.
