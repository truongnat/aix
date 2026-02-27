---
description: review workflow
---

# Workflow: review
Schema: antigrav.workflow@v1
Domain: agent

## Step: load_context
Skill: agent.semantic_search
Input: 5:::diff summary coding rule violations review checklist

## Step: generate_review
Skill: agent.llm_subagent
DependsOn: load_context
Input: reviewer:::Generate JSON review with findings, severity, and concrete remediation.

## Step: summarize
Skill: demo.echo
DependsOn: generate_review
Input: Review workflow completed.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: summarize
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

