---
description: Build a showcase video plan from real project runtime I/O and artifacts
source: self
---

# Workflow: dev-create-showcase-video
Schema: antigrav.workflow@v1
Domain: dev
Goal: Produce a creator-grade Remotion showcase plan that proves structure, CLI, use cases, and landing-page output.

## Step: collect_repo_structure
Skill: agent.run_script
Input: git ls-files src

## Step: collect_cli_surface
Skill: agent.run_script
DependsOn: collect_repo_structure
Input: git grep -n "cargo run --" README.md docs/CLI_USAGE.md

## Step: collect_use_case_signals
Skill: agent.run_script
DependsOn: collect_cli_surface
Input: git grep -n "ai-engineering" README.md .agents/workflows

## Step: synthesize_creator_brief
Skill: agent.llm_subagent
DependsOn: collect_use_case_signals
Input: architect:::Create a concise creator brief with sections STRUCTURE, CLI, USE_CASES, SUCCESS_OUTPUT from these inputs: structure={{collect_repo_structure}} cli={{collect_cli_surface}} use_cases={{collect_use_case_signals}}

## Step: remotion_storyboard
Skill: dev.remotion_io_visualizer
DependsOn: synthesize_creator_brief
Input: Build a creator-grade Remotion storyboard and implementation plan using creator_brief={{synthesize_creator_brief}}
