---
description: climate-tech review workflow focused on correctness, risk, and release readiness
---
# Workflow: climate-tech-review
Schema: antigrav.workflow@v1
Domain: climate-tech

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

## Step: review_decision
Skill: agent.llm_subagent
DependsOn: review_risk_register
Input: climate-tech/reviewer:::Return merge recommendation with blocking issues from:
{{review_risk_register}}

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: review_decision
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

