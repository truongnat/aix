# Decision framework and trade-offs

## JavaScript vs TypeScript

| Situation | Lean |
|-----------|------|
| **Public library** | Often TypeScript declarations even if JS source |
| **App codebase growing** | **`typescript-pro`** for regressions cheaper than prod bugs |

Raw JS stays valid when **`typescript-pro`** isn’t in scope — document “consider TS” rather than mandate.

## Immutability vs perf

| Pattern | Trade-off |
|---------|-----------|
| **Spread/rest updates** | Safer reasoning; allocates more |
| **Mutable hot paths** | Faster; requires invariants & tests |

## Explicit async API

| Choice | Guidance |
|--------|-----------|
| **Always return Promise** | Callers can `await` consistently |
| **Sync + callback** hybrid | Isolate at boundary; don’t leak upward — **`decision-tree.md`** |

## Strictness

- **`===`**, **`Object.hasOwn`**, early validation at IO boundaries reduce surprise — **`tips-and-tricks.md`**.
