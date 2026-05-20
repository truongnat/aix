---
description: Imported from antigravity-awesome-skills workflow 'build-ai-agent-system'
source: https://github.com/sickn33/antigravity-awesome-skills
category: ai-agents
---
# Workflow: antigravity-build-ai-agent-system
Schema: agentic-sdlc.workflow@v1
Domain: antigravity
Goal: Build an AI Agent System

## Step: stage_01_define_use_case_and_reliability_targets
Skill: antigravity.ai-agents-architect
Input: Goal: Choose a narrow use case and measurable quality goals. Notes: Set latency, quality, and failure-rate thresholds before implementation. Companion skills: ai-agents-architect, agent-evaluation, product-manager-toolkit

## Step: stage_02_design_architecture_and_retrieval
Skill: antigravity.llm-app-patterns
Input: Goal: Design tools, memory, and retrieval strategy for the agent. Notes: Keep retrieval quality measurable and version prompt/tool contracts. Companion skills: llm-app-patterns, rag-implementation, vector-database-engineer, embedding-strategies
DependsOn: stage_01_define_use_case_and_reliability_targets

## Step: stage_03_implement_orchestration
Skill: antigravity.langgraph
Input: Goal: Implement the orchestration loop and production safeguards. Notes: Start with constrained tool permissions and explicit fallback behavior. Companion skills: langgraph, mcp-builder, workflow-automation
DependsOn: stage_02_design_architecture_and_retrieval

## Step: stage_04_evaluate_and_iterate
Skill: antigravity.agent-evaluation
Input: Goal: Run benchmark scenarios and improve weak areas systematically. Notes: Use test datasets and failure buckets to guide each iteration cycle. Companion skills: agent-evaluation, langfuse, kaizen
DependsOn: stage_03_implement_orchestration

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: stage_04_evaluate_and_iterate
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

