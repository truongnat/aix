# Decision framework and trade-offs

## Multi-platform scope

| Stance | When |
|--------|------|
| **Ship iOS + Android only** | Validate plugins per store policy; simpler CI |
| **+ Web** | Layout/input differ; renderer choice matters — **`edge-cases.md`** |
| **+ Desktop** | Window model, shortcuts, distribution — **`edge-cases.md`** |

**Rule:** Every **claimed** supported platform gets a **smoke path** in CI or manual matrix — **`testing-pro`**.

## State management at scale

| Pattern | Fits |
|---------|------|
| **Riverpod / Bloc / Provider** | Shared async data, testability |
| **`StatefulWidget` only** | Ephemeral UI; risky as global state bucket — **`decision-tree.md`** |

Pick **team consistency** over marginal purity — **`anti-patterns.md`**.

## Routing depth

| Need | Choice |
|------|--------|
| Deep links, redirects, declarative stacks | **go_router** |
| Few screens | **Navigator** — **`decision-tree.md`** |

## Performance vs simplicity

| Lever | Trade-off |
|-------|-----------|
| **`const` constructors** | Less rebuild work; requires immutable args |
| **Coarse `ListenableBuilder`** | Simple code; may over-rebuild — prefer selectors — **`tips-and-tricks.md`** |
| **Isolates** | Keeps UI smooth; serialization overhead — **`tips-and-tricks.md`** |

## Add-to-app vs standalone

- **Add-to-app** (Flutter in existing native shell) — boundary contracts and engine lifecycle dominate; pair with native skills — **`integration-map.md`**.
