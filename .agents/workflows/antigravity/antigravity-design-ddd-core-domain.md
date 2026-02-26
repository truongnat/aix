---
description: Imported from antigravity-awesome-skills workflow 'design-ddd-core-domain'
source: https://github.com/sickn33/antigravity-awesome-skills
category: architecture
---
# Workflow: antigravity-design-ddd-core-domain
Schema: antigrav.workflow@v1
Domain: antigravity
Goal: Design a DDD Core Domain

## Step: stage_01_assess_ddd_fit_and_scope
Skill: antigravity.domain-driven-design
Input: Goal: Decide if full DDD is justified and define the modeling scope. Notes: Document why DDD is needed, where to keep it lightweight, and what success looks like. Companion skills: domain-driven-design, architecture-decision-records

## Step: stage_02_create_strategic_model
Skill: antigravity.ddd-strategic-design
Input: Goal: Define subdomains, bounded contexts, and ubiquitous language. Notes: Classify subdomains and assign ownership before making implementation decisions. Companion skills: ddd-strategic-design
DependsOn: stage_01_assess_ddd_fit_and_scope

## Step: stage_03_map_context_relationships
Skill: antigravity.ddd-context-mapping
Input: Goal: Define context integration patterns, ownership, and translation boundaries. Notes: Prefer explicit contracts and anti-corruption layers where domain models diverge. Companion skills: ddd-context-mapping
DependsOn: stage_02_create_strategic_model

## Step: stage_04_implement_tactical_model
Skill: antigravity.ddd-tactical-patterns
Input: Goal: Encode invariants with aggregates, value objects, repositories, and domain events. Notes: Start from invariants and transaction boundaries, not from tables or endpoints. Companion skills: ddd-tactical-patterns, test-driven-development
DependsOn: stage_03_map_context_relationships

## Step: stage_05_adopt_evented_patterns_selectively
Skill: antigravity.cqrs-implementation
Input: Goal: Apply CQRS, event store, projections, and sagas only where required. Notes: Use evented patterns where consistency and scale tradeoffs are explicit and accepted. Companion skills: cqrs-implementation, event-store-design, projection-patterns, saga-orchestration
DependsOn: stage_04_implement_tactical_model
