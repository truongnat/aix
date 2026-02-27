---
description: Index current project and generate workflow/skill upgrade recommendations
source: self
---

# Workflow: dev-project-intelligence
Schema: antigrav.workflow@v1
Domain: dev
Goal: Understand project quickly, then suggest best workflows and skills to improve delivery.

## Step: detect_current_branch
Skill: agent.run_script
Input: git rev-parse --abbrev-ref HEAD

## Step: snapshot_repo_files
Skill: agent.run_script
DependsOn: detect_current_branch
Input: git ls-files

## Step: snapshot_recent_commits
Skill: agent.run_script
DependsOn: snapshot_repo_files
Input: git log --oneline -n 30

## Step: build_project_index
Skill: agent.llm_subagent
DependsOn: snapshot_recent_commits
Input: architect:::Build a concise project index from file inventory and commit history. Return key modules, architecture boundaries, stack signals, and probable product purpose.

## Step: retrieve_project_context
Skill: agent.semantic_search
DependsOn: build_project_index
Input: 10:::project purpose architecture stack modules testing ci deployment roadmap

## Step: list_available_workflows
Skill: agent.run_script
DependsOn: retrieve_project_context
Input: git ls-files .agents/workflows

## Step: list_available_skills
Skill: agent.run_script
DependsOn: list_available_workflows
Input: git ls-files .agents/skills

## Step: list_available_templates
Skill: agent.run_script
DependsOn: list_available_skills
Input: git ls-files .agents/templates

## Step: draft_recommendations
Skill: dev.project_intelligence_advisor
DependsOn: list_available_templates
Input: |
  branch={{detect_current_branch}}
  files={{snapshot_repo_files}}
  commits={{snapshot_recent_commits}}
  inferred_index={{build_project_index}}
  project_context={{retrieve_project_context}}
  workflows={{list_available_workflows}}
  skills={{list_available_skills}}
  templates={{list_available_templates}}

## Step: automation_suggestions
Skill: antigravity.workflow-automation
DependsOn: draft_recommendations
Input: Suggest automation opportunities and sequencing from this recommendation draft: {{draft_recommendations}}

## Step: finalize_upgrade_plan
Skill: agent.llm_subagent
DependsOn: automation_suggestions
Input: reviewer:::Return final markdown report with sections: 1) Project Summary 2) Top Workflow Suggestions 3) Top Skill Suggestions 4) 7-Day Quick Wins 5) 30-Day Upgrade Plan 6) Risks. Use only available workflows/skills from context.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: finalize_upgrade_plan
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

