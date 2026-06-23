## Tool Routing

Read `.harness/TOOL_CONTEXT.md` first when it exists.

Otherwise run `node scripts/discover-tools.js --markdown` when available.

For deliberative user choices, read `.ai-harness/provider-interaction.md` or run `node scripts/discover-provider-tools.js` and invoke the listed provider tool.

Prefer capability routing over tool-name memory:

- code search: `rg` before `grep`
- diff review: `git diff`
- repo structure: [CodeGraph](https://github.com/colbymchenry/codegraph) when installed, otherwise file tree plus import scan

Treat missing optional tools as degraded routing, not hard failure unless no safe fallback exists.
