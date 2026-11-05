# GitNexus graph workflow (deep repo analysis)

Use this when **GitNexus** is available: indexed repo with code graph. The graph answers **who calls what** and **blast radius** — complementary to text search.

## Preconditions

1. **Build the graph** — Run `node dist/tools.js build-graph` to parse codebase and create graph.json:
   ```bash
   node dist/tools.js build-graph
   # or with custom dir
   node dist/tools.js build-graph --dir ./src --out ./my-graph
   ```
2. **Graph location** — Default output: `.agents/devkit/project-graph/graph.json`

## GitNexus CLI tools (typical order for bug hunting)

| Command | Use for bug discovery |
|---------|------------------------|
| **`query-graph <symbol>`** | Search for symbols by name — surfaces functions, classes matching query. |
| **`query-graph <symbol> --mode callers`** | **Callers** of a symbol — who calls this function/class. |
| **`query-graph <symbol> --mode callees`** | **Callees** of a symbol — what this function calls. |
| **`impact-analysis <file-path>`** | **Blast radius** — find all code that depends on symbols in the changed file. |

## Loop

1. **Reproduce** or **hypothesize** (error message, stack, flaky test).
2. **`query-graph <keyword>`** to find relevant symbols.
3. **`query-graph <symbol> --mode callers`** to see who calls the suspect function.
4. **`impact-analysis <file>`** to list **related** code paths that might share the defect or need regression tests.
5. **Triage** — Separate **confirmed** bugs from **candidates** (needs test or human proof).

## Example workflow

```bash
# 1. Build graph
node dist/tools.js build-graph

# 2. Search for suspect function
node dist/tools.js query-graph "calculateTotal"
# → Found: calculateTotal (function) @ src/utils.ts:15

# 3. Find who calls it
node dist/tools.js query-graph "calculateTotal" --mode callers
# → Found: checkout (function) @ src/cart.ts:42
# → Found: applyDiscount (function) @ src/pricing.ts:28

# 4. Check blast radius if modifying utils.ts
node dist/tools.js impact-analysis "src/utils.ts"
# → Shows all symbols that depend on code in utils.ts
```

## Limits

- Graph reflects **last build** — not live if code changed. Re-run `build-graph` after major changes.
- **Heuristic parsing** — Uses regex patterns, not full AST. May miss complex call patterns.
- **Language support** — TypeScript/JavaScript, Python, Go, Rust. Limited support for other languages.
- GitNexus does not replace **runtime** debugging or **SAST** — combine with **`testing-pro`** and **`security-pro`**.

## Related commands

- `npm run build-graph` — Alias for `node dist/tools.js build-graph`
- See `repo-tooling-pro` skill for more tooling options.
