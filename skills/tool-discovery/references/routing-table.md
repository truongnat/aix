# Routing Table

| Capability | Preferred | Fallback |
|------------|-----------|----------|
| code-search | rg | git grep, grep |
| diff-review | git diff | user-provided diff |
| repo-structure | codegraph | file tree plus import scan |
| parallel-work | git worktree | branch/stash workflow |

See `tool-capabilities/TOOL_ROUTING.md` for the canonical table.
