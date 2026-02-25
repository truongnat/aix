# Workflow: release
Domain: agent

## Step: ensure_clean
Skill: agent.run_script
Input: git status --porcelain

## Step: full_validation
Skill: agent.run_script
DependsOn: ensure_clean
Input: cargo test

## Step: generate_changelog
Skill: agent.llm_subagent
DependsOn: full_validation
Input: releaser:::Generate concise changelog from recent commits and workflow summaries.

## Step: tag_release
Skill: agent.run_script
DependsOn: generate_changelog
Input: git tag v1.0.0

## Step: commit_release_notes
Skill: agent.git_commit
DependsOn: tag_release
Input:
chore(release): prepare v1.0.0

- full validation executed
- changelog generated
- release tag created

## Step: summarize
Skill: demo.echo
DependsOn: commit_release_notes
Input: Release workflow completed.
