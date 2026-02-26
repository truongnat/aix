---
description: Imported from antigravity-awesome-skills workflow 'security-audit-web-app'
source: https://github.com/sickn33/antigravity-awesome-skills
category: security
---
# Workflow: antigravity-security-audit-web-app
Schema: antigrav.workflow@v1
Domain: antigravity
Goal: Security Audit for a Web App

## Step: stage_01_define_scope_and_threat_model
Skill: antigravity.ethical-hacking-methodology
Input: Goal: Identify critical assets, trust boundaries, and threat scenarios. Notes: Document in-scope targets, assumptions, and out-of-scope constraints. Companion skills: ethical-hacking-methodology, threat-modeling-expert, attack-tree-construction

## Step: stage_02_review_authentication_and_authorization
Skill: antigravity.broken-authentication
Input: Goal: Find broken auth patterns and access-control weaknesses. Notes: Prioritize account takeover and privilege escalation paths. Companion skills: broken-authentication, auth-implementation-patterns, idor-testing
DependsOn: stage_01_define_scope_and_threat_model

## Step: stage_03_assess_api_and_input_security
Skill: antigravity.api-security-best-practices
Input: Goal: Detect high-impact API and injection risks. Notes: Map findings to severity and exploitability, not only CVSS. Companion skills: api-security-best-practices, api-fuzzing-bug-bounty, top-web-vulnerabilities
DependsOn: stage_02_review_authentication_and_authorization

## Step: stage_04_harden_and_verify
Skill: antigravity.security-auditor
Input: Goal: Translate findings into concrete remediations and retest. Notes: Track remediation owners and target dates; verify each fix with evidence. Companion skills: security-auditor, sast-configuration, verification-before-completion
DependsOn: stage_03_assess_api_and_input_security
