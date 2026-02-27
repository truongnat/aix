---
description: Build a value-first landing page from brief to implementation-ready handoff
source: self
---

# Workflow: dev-build-landing-page
Schema: antigrav.workflow@v1
Domain: dev
Goal: Produce a production-ready landing page plan that maximizes value communication and conversion clarity.

## Step: clarify_goal
Skill: agent.llm_subagent
Input: architect:::Extract objective, audience, core pain, promised outcome, trust signals, primary CTA, and constraints from task context. Output concise deterministic bullets.

## Step: retrieve_repo_context
Skill: agent.semantic_search
DependsOn: clarify_goal
Input: 12:::product value proposition landing page sections docs architecture quickstart command examples tone branding conversion goals

## Step: value_narrative
Skill: agent.llm_subagent
DependsOn: retrieve_repo_context
Input: analyst:::Build a value narrative with fields: problem, differentiator, proof, outcome, objections, and CTA. Use only goal={{clarify_goal}} and context={{retrieve_repo_context}}.

## Step: spec_architecture
Skill: dev.landing_page_architect
DependsOn: value_narrative
Input: Build landing-page architecture spec from goal={{clarify_goal}} context={{retrieve_repo_context}} value={{value_narrative}}.

## Step: quality_gate_spec
Skill: agent.llm_subagent
DependsOn: spec_architecture
Input: reviewer:::Assess architecture quality for value clarity, narrative flow, CTA strength, accessibility, and mobile hierarchy. Return required fixes and pass/fail.

## Step: implementation_handoff
Skill: dev.landing_page_implementer
DependsOn: quality_gate_spec
Input: Generate file-level implementation plan from architecture={{spec_architecture}} and required_fixes={{quality_gate_spec}}. Keep diffs minimal and explicit.

## Step: testing_strategy
Skill: antigravity.test-driven-development
DependsOn: implementation_handoff
Input: Define pragmatic validation plan for responsive behavior, accessibility, performance, content clarity, and CTA path from: {{implementation_handoff}}

## Step: review_gate
Skill: antigravity.code-review-checklist
DependsOn: testing_strategy
Input: Review completeness and risk from: {{implementation_handoff}} tests={{testing_strategy}}

## Step: final_execution_plan
Skill: agent.llm_subagent
DependsOn: review_gate
Input: reviewer:::Return final execution checklist with ordered file edits, validation sequence, and done criteria from all prior outputs.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: final_execution_plan
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

