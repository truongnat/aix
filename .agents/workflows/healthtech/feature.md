---
description: healthtech feature delivery with impact analysis and acceptance gates
---
# Workflow: healthtech-feature
Schema: antigrav.workflow@v1
Domain: healthtech
MaxCpuMs: 240000
MaxWallTimeMs: 900000
MaxNetworkCalls: 35

## Step: intent_triage
Skill: agent.llm_subagent
Input: healthtech/architect:::Clarify objective, scope boundaries, and measurable acceptance criteria for this feature.

## Step: impact_analysis
Skill: healthtech.impact_analyzer
DependsOn: intent_triage
Retry: 1
Input: {{intent_triage}}

## Step: implementation_plan
Skill: agent.llm_subagent
DependsOn: impact_analysis
Input: healthtech/implementer:::Create a deterministic implementation plan from this context:
{{impact_analysis}}

## Step: acceptance_gate
Skill: healthtech.acceptance_guard
DependsOn: implementation_plan
Retry: 1
Input: {{implementation_plan}}

## Step: risk_register
Skill: healthtech.risk_register
DependsOn: acceptance_gate
OnFailure: Continue
Input: {{acceptance_gate}}

## Step: finalize
Skill: demo.echo
DependsOn: risk_register
Input: Feature workflow ready for domain healthtech.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: finalize
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

