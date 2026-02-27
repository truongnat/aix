---
description: cloud-platform review workflow focused on correctness, risk, and release readiness
---
# Workflow: cloud-platform-review
Schema: antigrav.workflow@v1
Domain: cloud-platform

## Step: review_context
Skill: agent.llm_subagent
Input: cloud-platform/reviewer:::Summarize current diff intent, architecture impact, and likely weak spots.

## Step: specification_gate
Skill: cloud-platform.acceptance_guard
DependsOn: review_context
Input: {{review_context}}

## Step: review_risk_register
Skill: cloud-platform.risk_register
DependsOn: specification_gate
Input: {{specification_gate}}

## Step: review_decision
Skill: agent.llm_subagent
DependsOn: review_risk_register
Input: cloud-platform/reviewer:::Return merge recommendation with blocking issues from:
{{review_risk_register}}
