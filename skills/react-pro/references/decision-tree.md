# Decision tree — React

## Hooks vs derived state vs effect

```
Need a value shown in the UI:
├── Can it be computed from props/state already in render?
│   └── Yes → use derived value in render (no useState for a pure transform)
└── No — needs subscription / browser API / async?
    ├── Sync with external system (network, DOM subscription, timer)?
    │   └── useEffect (or library that encapsulates it)
    └── Event handler enough? (click, submit)
        └── Prefer handler over effect
```

## Where should this state live?

```
State used by one leaf only?
└── Yes → colocate in that subtree (avoid context for local UI)

Shared across distant components?
├── Update rarely / many consumers → context or external store (document choice)
└── Server-owned → fetch/RPC at source; avoid duplicating server truth in client state
```

## List keys

```
List can reorder, filter, or delete items?
├── Yes → stable id from domain (never index)
└── No — static marketing list, never reordered
    └── Index key acceptable; still prefer id if available
```

## memo / useMemo / useCallback

```
Measured re-render cost?
├── No → skip memoization; ship readable code first
└── Yes → memoize the smallest child that stabilizes props; useCallback only if a memoized child depends on referential identity
```

## Error Boundary vs Suspense-only

```
Recoverable render error in a subtree (bad data, lazy chunk)?
├── Yes → Error Boundary at route/feature boundary + fallback UI
└── Async wait only → Suspense fallback; still add Boundary above lazy imports where chunk load can throw
```
