# Workflow: ValidFlow
Domain: demo

## Step: s1
Skill: parse_number
Input: 42

## Step: s2
Skill: is_positive
Input: {{s1}}
DependsOn: s1
