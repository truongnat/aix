---
description: Imported from antigravity-awesome-skills workflow 'qa-browser-automation'
source: https://github.com/sickn33/antigravity-awesome-skills
category: testing
---
# Workflow: antigravity-qa-browser-automation
Schema: antigrav.workflow@v1
Domain: antigravity
Goal: QA and Browser Automation

## Step: stage_01_prepare_test_strategy
Skill: antigravity.e2e-testing-patterns
Input: Goal: Define critical user journeys, environments, and test data. Notes: Focus on business-critical flows and keep setup deterministic. Companion skills: e2e-testing-patterns, test-driven-development, code-review-checklist

## Step: stage_02_implement_browser_tests
Skill: antigravity.browser-automation
Input: Goal: Automate key flows with resilient locators and stable waits. Notes: Use go-playwright for Go-native automation projects and Playwright for JS/TS stacks. Companion skills: browser-automation, go-playwright
DependsOn: stage_01_prepare_test_strategy

## Step: stage_03_triage_failures_and_harden
Skill: antigravity.systematic-debugging
Input: Goal: Stabilize flaky tests and establish repeatable CI execution. Notes: Classify failures by root cause: selector drift, timing, environment, data. Companion skills: systematic-debugging, test-fixing, verification-before-completion
DependsOn: stage_02_implement_browser_tests

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: stage_03_triage_failures_and_harden
Input: reviewer:::Run internet-surface security check for this workflow using outputs from previous steps. Return pass/fail, top risks, and required mitigations before completion.

