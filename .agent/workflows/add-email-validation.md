# Workflow: Add Email Validation
Domain: agent

## Step: analyze_code
Skill: agent.llm_subagent
Input: architect:::Review user service implementation and identify all email handling paths and existing validation points.

## Step: implement_validation
Skill: agent.llm_subagent
DependsOn: analyze_code
Input: implementer:::Design a minimal regex/email validation patch strategy and list precise code edits.

## Step: generate_tests
Skill: agent.llm_subagent
DependsOn: implement_validation
Input: tester:::Produce unit test cases for valid/invalid email inputs, including boundary and malformed cases.
