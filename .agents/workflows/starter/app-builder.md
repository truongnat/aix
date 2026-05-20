---
description: Starter workflow that turns a natural-language task into real local app artifacts and validates them.
---
# Workflow: starter-app-builder
Schema: agentic-sdlc.workflow@v1
Domain: agent

## Step: blueprint
Skill: agent.artifact_builder
Retry: 1
OnFailure: FailFast
Input: Create a small practical app from this task:
{{task}}

Requirements:
- keep scope minimal
- generate real files under local_tmp/generated-app
- include a real validation_command
- prefer simple local stacks and dependency-light output

## Step: blueprint_gate
Skill: agent.artifact_blueprint_gate
DependsOn: blueprint
Input: {{blueprint}}

## Step: apply_changes
Skill: agent.write_files_from_json
DependsOn: blueprint_gate
Input: {{blueprint}}

## Step: validation_command
Skill: agent.extract_validation_command
DependsOn: apply_changes
Input: {{blueprint}}

## Step: validation_gate
Skill: agent.run_script
DependsOn: validation_command
Retry: 1
OnFailure: FailFast
Input: {{validation_command}}

## Step: finalize
Skill: demo.echo
DependsOn: validation_gate
Input: Starter app-builder workflow completed successfully.
