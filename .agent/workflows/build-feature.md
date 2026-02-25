# Workflow: Build Feature
Domain: agent

## Step: detect_current_branch
Skill: agent.run_script
Input: git rev-parse --abbrev-ref HEAD

## Step: clarify_requirement
Skill: agent.llm_subagent
DependsOn: detect_current_branch
Input: architect:::Summarize the feature requirement and assumptions in strict mode, with clear confirmation checkpoints.

## Step: identify_affected_files
Skill: agent.llm_subagent
DependsOn: clarify_requirement
Input: analyst:::List only directly affected files and explain why each file is in scope.

## Step: propose_minimal_plan
Skill: agent.llm_subagent
DependsOn: identify_affected_files
Input: planner:::Propose the minimal diff implementation plan with ordered steps and approval gates.

## Step: implement_minimal_diff
Skill: agent.llm_subagent
DependsOn: propose_minimal_plan
Input: implementer:::Implement only the approved minimal diff and avoid unrelated changes.
