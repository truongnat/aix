---
description: Generate high-conversion video concepts from project evidence and workflow traces
source: self
---

# Workflow: dev-video-idea-lab
Schema: agentic-sdlc.workflow@v1
Domain: dev
Goal: Produce a practical backlog of creator-grade video ideas that prove project value with real CLI/runtime evidence.

## Step: collect_project_surface
Skill: agent.run_script
Input: git ls-files src .agents/workflows docs/landing-astro

## Step: collect_cli_proof
Skill: agent.run_script
DependsOn: collect_project_surface
Input: git grep -n "cargo run --" README.md docs/CLI_USAGE.md

## Step: collect_runtime_artifacts
Skill: agent.run_script
DependsOn: collect_cli_proof
Input: git ls-files docs/landing-astro/public/media docs/landing-astro/public/remotion-data

## Step: research_story_angles
Skill: agent.llm_subagent
DependsOn: collect_runtime_artifacts
Input: analyst:::From project_surface={{collect_project_surface}} cli={{collect_cli_proof}} runtime={{collect_runtime_artifacts}}, derive 12 value-first storytelling angles for software demo videos. Keep each angle tied to real proof points.

## Step: generate_concept_pack
Skill: agent.llm_subagent
DependsOn: research_story_angles
Input: architect:::Create 10-15 concrete video concepts from angles={{research_story_angles}}. For each concept include: title, audience, hook(3s), structure/CLI/use-case/output beats, recommended duration, platform fit (YouTube/LinkedIn/X), CTA, and production complexity (low/medium/high).

## Step: remotion_production_plan
Skill: dev.remotion_io_visualizer
DependsOn: generate_concept_pack
Input: Build a Remotion-oriented production plan for top 3 concepts from concept_pack={{generate_concept_pack}} using runtime_evidence={{collect_runtime_artifacts}}.

## Step: prioritized_backlog
Skill: agent.llm_subagent
DependsOn: remotion_production_plan
Input: planner:::Return prioritized 2-week backlog from concepts={{generate_concept_pack}} remotion={{remotion_production_plan}}. Output only: week plan, daily deliverables, dependencies, and success metrics (watch-through, CTA click, demo request).

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: prioritized_backlog
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

