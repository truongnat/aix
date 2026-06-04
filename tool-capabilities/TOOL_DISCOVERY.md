# Tool Discovery

## Purpose

Give agents an explicit way to detect which local developer tools are available before they choose a strategy.

## Discovery Order

1. Read `.harness/TOOL_CONTEXT.md` if it already exists.
2. Run `node scripts/discover-tools.js --markdown` when the script is available.
3. Fall back to manual command checks only when the discovery script is missing or cannot run.

## Discovery Rules

- Prefer capability detection over hard-coding tool names into workflow logic.
- Treat optional tools as best-effort only.
- Never fail just because an optional tool is missing.
- If a required capability is unavailable and no safe fallback exists, return `Blocked` with a concrete question.

## Manual Fallback Checks

```bash
git --version
git worktree --help
rg --version
git grep -n "TODO" AGENTS.md
grep --version
find . -maxdepth 2 -type f
markitdown --help
```

## Output Expectations

Tool discovery should report:

- which tools are available
- which capabilities are blocked or degraded
- which routing choice should be preferred
- which missing tools are optional
