# Karpathy AI Coding Discipline Integration

This project integrates strict SDLC discipline inspired by Andrej Karpathy's observations on LLM coding pitfalls. The integration consists of four core principles designed to minimize overengineering, scope creep, and silent assumptions.

## Core Principles

### 1. Think Before Coding
- **Requirement**: Agents must surface assumptions and identify ambiguity before writing code.
- **Implementation**: The `karpathy-feature` workflow starts with a `think` step.
- **Benefit**: Reduces the "guessing" behavior of LLMs.

### 2. Simplicity First
- **Requirement**: Minimum code that solves the problem. No speculative features.
- **Implementation**: Injected system prompt and `simplicity_check` in the review workflow.
- **Benefit**: Keeps the codebase lean and maintainable.

### 3. Surgical Changes
- **Requirement**: Touch only what you must. Match existing style.
- **Implementation**: `surgical_check` in the review workflow and strict diff guidelines.
- **Benefit**: Minimizes side effects and keeps PRs easy to review.

### 4. Goal-Driven Execution
- **Requirement**: Define success criteria and verify them in a loop.
- **Implementation**: `plan` and `test` steps in workflows.
- **Benefit**: Ensures that the task is actually finished and verified.

## How to Use

### Global Enablement
Enabled via `.agents/rules/karpathy_rules.md`. Setting `"require_karpathy_discipline": true` will inject the discipline prompt into all `llm_subagent` calls.

### Workflow Integration
Use the `karpathy-feature` workflow for new features:
```bash
cargo run -- --workflow-id dev/karpathy-feature --task "Add input validation to src/cli/ops.rs"
```

### AI Agent Export
Export your discipline and rules to other tools:
```bash
# Export to all (CLAUDE.md, .cursor/rules, GEMINI.md)
cargo run -- workflow agent-export all
```

### MCP Server Mode
Expose your project's agentic capabilities as an MCP server:
```bash
cargo run -- workflow mcp-serve --transport stdio
```

## Configuration

- **Rules**: `.agents/rules/karpathy_rules.md`
- **Skill**: `.agents/skills/karpathy_discipline/SKILL.md`
- **Templates**: `.agents/templates/dev/karpathy_feature_prompt.md`
