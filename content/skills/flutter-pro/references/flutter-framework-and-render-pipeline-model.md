# Flutter framework and render pipeline (system model)

## Three trees

| Tree | Holds | Purpose |
|------|--------|---------|
| **Widget** | Configuration (immutable) | What you declare in `build` |
| **Element** | Stable identity / lifecycle | Links widget ↔ render object |
| **RenderObject** | Layout & paint | Sizes, positions, draws |

**You write widgets;** the framework diffuses updates through elements and schedules layout/paint — **`widgets.md`**.

## Frame pipeline (mental map)

```text
Event / setState → mark dirty → build phase → layout → compositing bits → paint
```

- **`build`** should stay **cheap and pure** — expensive work belongs in isolates/async outside hot paths — **`tips-and-tricks.md`**.
- **Jank** = work exceeds frame budget (~16 ms @ 60 Hz); use **DevTools Timeline** — **`failure-modes-detection-mitigation.md`**.

## Embedders (platform)

| Surface | Notes |
|---------|-------|
| **Mobile** | Single main isolate for UI by default; platform channels bridge to Kotlin/Swift |
| **Web** | Renderer choice (CanvasKit/HTML), different file/clipboard — **`edge-cases.md`** |
| **Desktop** | Window chrome, menus, shortcuts — **`edge-cases.md`** |

## State → UI contract

- **InheritedWidget / Provider / Riverpod** propagate down; **`BuildContext`** reads at dependency sites — minimize rebuild scope — **`decision-tree.md`**.
