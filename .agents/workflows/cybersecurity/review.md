---
description: cybersecurity review workflow focused on correctness, risk, and release readiness
---
# Workflow: cybersecurity-review
Schema: antigrav.workflow@v1
Domain: cybersecurity

## Step: review_context
Skill: agent.llm_subagent
Input: cybersecurity/reviewer:::Summarize current diff intent, architecture impact, and likely weak spots.

## Step: specification_gate
Skill: cybersecurity.acceptance_guard
DependsOn: review_context
Input: {{review_context}}

## Step: review_risk_register
Skill: cybersecurity.risk_register
DependsOn: specification_gate
Input: {{specification_gate}}

## Step: review_decision
Skill: agent.llm_subagent
DependsOn: review_risk_register
Input: cybersecurity/reviewer:::Return merge recommendation with blocking issues from:
{{review_risk_register}}
