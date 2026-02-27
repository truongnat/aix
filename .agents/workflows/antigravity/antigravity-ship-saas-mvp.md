---
description: Imported from antigravity-awesome-skills workflow 'ship-saas-mvp'
source: https://github.com/sickn33/antigravity-awesome-skills
category: web
---
# Workflow: antigravity-ship-saas-mvp
Schema: antigrav.workflow@v1
Domain: antigravity
Goal: Ship a SaaS MVP

## Step: stage_01_plan_the_scope
Skill: antigravity.brainstorming
Input: Goal: Convert the idea into a clear implementation plan and milestones. Notes: Define problem, user persona, MVP boundaries, and acceptance criteria before coding. Companion skills: brainstorming, concise-planning, writing-plans

## Step: stage_02_build_backend_and_api
Skill: antigravity.backend-dev-guidelines
Input: Goal: Implement the core data model, API contracts, and auth baseline. Notes: Prefer small vertical slices; keep API contracts explicit and testable. Companion skills: backend-dev-guidelines, api-patterns, database-design, auth-implementation-patterns
DependsOn: stage_01_plan_the_scope

## Step: stage_03_build_frontend
Skill: antigravity.frontend-developer
Input: Goal: Deliver the primary user flows with production-grade UX patterns. Notes: Prioritize onboarding, empty states, and one complete happy-path flow. Companion skills: frontend-developer, react-patterns, frontend-design
DependsOn: stage_02_build_backend_and_api

## Step: stage_04_test_and_validate
Skill: antigravity.test-driven-development
Input: Goal: Catch regressions and ensure key flows work before release. Notes: Use go-playwright when the product stack or QA tooling is Go-based. Companion skills: test-driven-development, systematic-debugging, browser-automation, go-playwright
DependsOn: stage_03_build_frontend

## Step: stage_05_ship_safely
Skill: antigravity.deployment-procedures
Input: Goal: Release with basic observability and rollback readiness. Notes: Define release checklist, minimum telemetry, and rollback triggers. Companion skills: deployment-procedures, observability-engineer, postmortem-writing
DependsOn: stage_04_test_and_validate

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: stage_05_ship_safely
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

