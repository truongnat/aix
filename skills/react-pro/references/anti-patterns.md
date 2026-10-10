# Anti-patterns — React

Patterns that often look reasonable but cause bugs or maintenance pain.

1. **Conditional hooks** — Hooks must run in the same order every render; never wrap hooks in `if`/`for` to “skip” work.
2. **Derived state in `useState`** — Storing values computable from props/other state causes sync bugs; compute in render or use `useMemo` for expensive pure derives.
3. **`useEffect(() => …, [])` for “run once”** when the real issue is wrong data flow — often should be derived state or event-driven logic.
4. **`{...props}` onto DOM elements** — Leaks unknown attributes; use prop destructuring and forward explicit DOM props.
5. **Index keys for mutable lists** — Reorder/delete corrupts local state keyed by position.
6. **Effects for every state change** — Prefer event handlers; effects for synchronization with external systems.
7. **Premature `memo` everywhere** — Adds noise; measure first, memoize hot subtrees.
8. **Ignoring Suspense / error boundaries** — Async routes and lazy components need boundaries for loading and failure.

See also: [decision-tree.md](decision-tree.md), [edge-cases.md](edge-cases.md).
