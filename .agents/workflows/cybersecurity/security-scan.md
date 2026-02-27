---
description: Deterministic security scan workflow for package integrity and internet-surface risk
source: self
---
# Workflow: cybersecurity-security-scan
Schema: antigrav.workflow@v1
Domain: cybersecurity
Goal: Run policy checks and produce a security decision with explicit mitigations.

## Step: package_integrity
Skill: agent.run_script
Input: bash -lc './target/debug/agentic-sdlc workflow check'

## Step: quality_integrity
Skill: agent.run_script
DependsOn: package_integrity
Input: bash -lc './target/debug/agentic-sdlc workflow quality-skills'

## Step: collect_security_surface
Skill: agent.run_script
DependsOn: quality_integrity
Input: git grep -n -e "allow_network" -e "executor" -e "run_script" .agents/skills src

## Step: security_analysis
Skill: cybersecurity.security_scan_guard
DependsOn: collect_security_surface
Input: Analyze security posture from package_check={{package_integrity}} and surface={{collect_security_surface}}. Also report follow-up actions if strict skill quality checks require manual remediation.

## Step: release_recommendation
Skill: agent.llm_subagent
DependsOn: security_analysis
Input: cybersecurity/reviewer:::Return a GO/NO-GO recommendation with the top blocking risks and exact remediation actions from: {{security_analysis}}

## Step: internet_security_check
Skill: cybersecurity.security_scan_guard
DependsOn: release_recommendation
Input: Run final internet-surface security gate for this workflow and confirm whether execution is safe to proceed.
