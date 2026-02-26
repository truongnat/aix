---
description: Build a landing page feature from brief to implementation-ready handoff
source: self
---

# Workflow: dev-build-landing-page
Schema: antigrav.workflow@v1
Domain: dev
Goal: Produce a production-ready landing page implementation plan with file-level outputs.

## Step: clarify_goal
Skill: agent.llm_subagent
Input: architect:::Summarize landing-page objective, audience, and constraints from task context. Output concise bullets.

## Step: retrieve_repo_context
Skill: agent.semantic_search
DependsOn: clarify_goal
Input: 8:::{{clarify_goal}}

## Step: spec_architecture
Skill: dev.landing_page_architect
DependsOn: retrieve_repo_context
Input: Build landing-page architecture spec from: goal={{clarify_goal}} context={{retrieve_repo_context}}

## Step: design_direction
Skill: antigravity.frontend-design
DependsOn: spec_architecture
Input: Propose visual direction, hierarchy, typography, and conversion-focused UX from: {{spec_architecture}}

## Step: component_strategy
Skill: antigravity.react-patterns
DependsOn: design_direction
Input: Propose component architecture and reusable composition plan from: {{design_direction}}

## Step: implementation_handoff
Skill: dev.landing_page_implementer
DependsOn: component_strategy
Input: Generate file-level implementation plan from architecture={{spec_architecture}} design={{design_direction}} components={{component_strategy}}

## Step: testing_strategy
Skill: antigravity.test-driven-development
DependsOn: implementation_handoff
Input: Define pragmatic test plan for landing page feature from: {{implementation_handoff}}

## Step: review_gate
Skill: antigravity.code-review-checklist
DependsOn: testing_strategy
Input: Review completeness and risk from: {{implementation_handoff}} tests={{testing_strategy}}

## Step: final_execution_plan
Skill: agent.llm_subagent
DependsOn: review_gate
Input: reviewer:::Return final execution checklist with ordered file edits, validation sequence, and done criteria from all prior outputs.
