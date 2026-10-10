# Failure modes — detection and mitigation (React)

## Contents

1. [Effects and state](#effects-and-state)
2. [Lists and identity](#lists-and-identity)
3. [Hydration and SSR](#hydration-and-ssr)
4. [Performance footguns](#performance-footguns)
5. [Security-adjacent JSX](#security-adjacent-jsx)

---

## Effects and state

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Infinite re-render / max update depth** | `setState` in render or effect without stable deps | Move to handler; fix deps; derived state in render — **`decision-tree.md`** |
| **Stale effect closure** | Stale data inside effect | Exhaustive deps or functional ref pattern; justify disables — **`tips-and-tricks.md`** |
| **Missing cleanup** | Leaks, duplicate listeners | Return cleanup; idempotent subscribe — **`edge-cases.md`** (Strict Mode) |

---

## Lists and identity

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Index keys + reorder** | Wrong row state after sort/filter | Stable domain `key` — **`anti-patterns.md`** |
| **Broad context** | Everything re-renders | Split context; colocate state — **`decision-tree.md`** |

---

## Hydration and SSR

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Hydration mismatch** | Console #418 / text mismatch | Defer client-only values to `useEffect`; match server output — **`edge-cases.md`** |
| **Client module in RSC** | Build error or wrong tree | `"use client"` boundary; no server import of client-only — **`nextjs-pro`** |

---

## Performance footguns

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Memo everywhere** | Harder code, same perf | Profile; memoize hot child — **`decision-tree.md`** |
| **Inline object in props to memo child** | Memo useless | Stable props or accept re-render — **`tips-and-tricks.md`** |

---

## Security-adjacent JSX

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **`dangerouslySetInnerHTML` with untrusted HTML** | XSS | Sanitize; avoid; CSP — **`security-pro`** |
| **`{...props}` to DOM`** | Unexpected `on*` or `href` injection | Destructure allowlist — **`anti-patterns.md`** |
