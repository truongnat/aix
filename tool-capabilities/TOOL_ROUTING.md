# Tool Routing

## Purpose

Route work through the strongest available local tool for each capability instead of relying on agent memory.

## Capability Routes

| Capability | Preferred | Fallback |
|---|---|---|
| `code-search` | `rg` | `git grep`, `grep` |
| `diff-review` | `git diff` | user-provided diff |
| `history-review` | `git log`, `git blame` | user-provided commit context |
| `parallel-work` | `git worktree` | normal branch or stash workflow |
| `document-to-markdown` | `markitdown` | ask user for extracted text |
| `repo-structure` | configured code graph tool | file tree plus import scan |
| `dependency-scan` | package manager or lockfile | grep imports |

## Routing Rules

- Prefer capability matches over tool-name matches.
- Use `rg` before `grep` when both are available.
- Use `git diff` and `git log` before asking the user for diff context.
- Use `git worktree` only when parallel isolation is useful and safe.
- Use code graph tools only when they are installed or configured.
- Treat missing optional tools as degraded routing, not as hard failure.

## Blocked Behavior

Return `Blocked` when:

- a required capability has no safe fallback
- the task depends on a rich document that cannot be read safely
- the user must choose between risky routing options
