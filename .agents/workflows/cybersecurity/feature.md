---
description: cybersecurity feature delivery with impact analysis and acceptance gates
---
# Workflow: cybersecurity-feature
Schema: antigrav.workflow@v1
Domain: cybersecurity
MaxCpuMs: 240000
MaxWallTimeMs: 900000
MaxNetworkCalls: 35

## Step: intent_triage
Skill: agent.llm_subagent
Input: cybersecurity/architect:::Clarify objective, scope boundaries, and measurable acceptance criteria for this feature.

## Step: impact_analysis
Skill: cybersecurity.impact_analyzer
DependsOn: intent_triage
Retry: 1
Input: {{intent_triage}}

## Step: implementation_plan
Skill: agent.llm_subagent
DependsOn: impact_analysis
Input: cybersecurity/implementer:::Create a deterministic implementation plan from this context:
{{impact_analysis}}

## Step: acceptance_gate
Skill: cybersecurity.acceptance_guard
DependsOn: implementation_plan
Retry: 1
Input: {{implementation_plan}}

## Step: risk_register
Skill: cybersecurity.risk_register
DependsOn: acceptance_gate
OnFailure: Continue
Input: {{acceptance_gate}}

## Step: finalize
Skill: demo.echo
DependsOn: risk_register
Input: Feature workflow ready for domain cybersecurity.
