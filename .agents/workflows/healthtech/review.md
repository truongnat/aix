---
description: healthtech review workflow focused on correctness, risk, and release readiness
---
# Workflow: healthtech-review
Schema: antigrav.workflow@v1
Domain: healthtech

## Step: review_context
Skill: agent.llm_subagent
Input: healthtech/reviewer:::Summarize current diff intent, architecture impact, and likely weak spots.

## Step: specification_gate
Skill: healthtech.acceptance_guard
DependsOn: review_context
Input: {{review_context}}

## Step: review_risk_register
Skill: healthtech.risk_register
DependsOn: specification_gate
Input: {{specification_gate}}

## Step: review_decision
Skill: agent.llm_subagent
DependsOn: review_risk_register
Input: healthtech/reviewer:::Return merge recommendation with blocking issues from:
{{review_risk_register}}
