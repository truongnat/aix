# Workflow: review
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
