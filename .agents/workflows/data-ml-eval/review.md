---
description: data-ml-eval review workflow focused on correctness, risk, and release readiness
---
# Workflow: data-ml-eval-review
Schema: antigrav.workflow@v1
Domain: data-ml-eval

## Step: review_context
Skill: agent.llm_subagent
Input: data-ml-eval/reviewer:::Summarize current diff intent, architecture impact, and likely weak spots.

## Step: specification_gate
Skill: data-ml-eval.acceptance_guard
DependsOn: review_context
Input: {{review_context}}

## Step: review_risk_register
Skill: data-ml-eval.risk_register
DependsOn: specification_gate
Input: {{specification_gate}}

## Step: review_decision
Skill: agent.llm_subagent
DependsOn: review_risk_register
Input: data-ml-eval/reviewer:::Return merge recommendation with blocking issues from:
{{review_risk_register}}
