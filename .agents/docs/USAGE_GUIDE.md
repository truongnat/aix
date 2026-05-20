# Agentic-SDLC Usage Guide (v1.2.0)

(Copied from root USAGE_GUIDE.md)

Welcome to the **Agentic-SDLC** harness. This guide explains how to use the framework to build, verify, and export AI agents with strict coding discipline.

## 1. Quick Start

Ensure you have Rust and Cargo installed. Clone the repository and run:

```bash
# Build the project
cargo build

# Run a simple workflow check
cargo run -- workflow check
```

## 2. Karpathy Coding Discipline

The framework enforces four core principles: **Think**, **Simplify**, **Surgical**, and **Goal-Driven**.

### Enablement
Check `.agents/rules/karpathy_rules.md`. Ensure:
```json
{
  "require_karpathy_discipline": true
}
```

### Running Workflows
Use the discipline-aware workflows for feature development:
```bash
cargo run -- --workflow-id dev/karpathy-feature --task "Your task description here"
```
This will guide the agent through thinking, planning, implementation, and verification gates.

## 3. Agent Export CLI

Sync your project rules and discipline with external AI tools (Cursor, Claude Code, Gemini).

```bash
# Export all configuration files
cargo run -- workflow agent-export all
```

This generates:
- `CLAUDE.md`: Behavioral guidelines for Claude-based agents.
- `.cursor/rules/karpathy-guidelines.mdc`: Global rules for Cursor.
- `GEMINI.md`: Package contract for Gemini agents.

## 4. MCP Server Mode

Expose `agentic-sdlc` as a Model Context Protocol (MCP) server.

```bash
cargo run -- workflow mcp-serve --transport stdio
```

You can then add this as a tool in Cursor or Claude Desktop by pointing it to the binary:
`path/to/agentic-sdlc workflow mcp-serve`

## 5. Development Workflow

1.  **Modify Rules**: Edit files in `.agents/rules/` to change behavioral constraints.
2.  **Add Skills**: Create new `.md` files in `.agents/skills/` to expand agent capabilities.
3.  **Define Workflows**: Add new workflows in `.agents/workflows/` to automate complex tasks.
4.  **Verify**: Always run `cargo test` and `cargo run -- workflow check` before committing.

## 6. Key Commands Reference

| Command | Description |
| --- | --- |
| `workflow check` | Validate all `.agents/` packages and schemas |
| `workflow list` | List available workflows and skills |
| `workflow agent-export` | Generate AI assistant config files |
| `workflow mcp-serve` | Start MCP server for tool interoperability |
| `workflow quality-skills` | Audit skill quality and documentation |

---
For more details, see [.agents/docs/KARPATHY_INTEGRATION.md](file:///Users/truongdev/Documents/projects/labs/agentic-sdlc/.agents/docs/KARPATHY_INTEGRATION.md).
