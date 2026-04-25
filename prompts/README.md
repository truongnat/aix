# Prompts Directory

Centralized location for prompt templates and system messages used by skills.

## Structure

- `system-prompts/` — Base system prompts for different skill types
- `response-templates/` — Output format templates
- `examples/` — Example prompts and responses

## Usage

Prompts in this directory are referenced by skills in their `Workflow` sections and used during agent execution.

## Best Practices

- Keep prompts concise and actionable
- Include examples where helpful
- Document any special variables or placeholders
- Version prompts when making significant changes
