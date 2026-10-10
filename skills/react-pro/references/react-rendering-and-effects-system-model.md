# React — rendering, reconciliation, and effects model

## Contents

1. [Render and commit](#render-and-commit)
2. [Reconciliation and keys](#reconciliation-and-keys)
3. [Effects as synchronization](#effects-as-synchronization)
4. [Concurrent features at a glance](#concurrent-features-at-a-glance)
5. [SSR and two trees](#ssr-and-two-trees)

Official reference: [React docs — Thinking in React / Escape Hatches](https://react.dev/) — confirm **React major** for API availability.

---

## Render and commit

**Render** is a pure function of props + state → React elements (cheap if you avoid heavy work inline). **Commit** applies DOM updates (or native views in RN).

**Why it matters:** expensive work belongs **outside** render (memoized computation, event handlers, effects for external sync) — **`anti-patterns.md`**.

---

## Reconciliation and keys

React matches list items by **`key`**. Unstable keys cause **state to attach to the wrong row** and unnecessary DOM churn.

**Why it matters:** identity follows **domain id**, not array index, when lists mutate — **`components-and-jsx.md`**.

---

## Effects as synchronization

`useEffect` connects React to **external systems** (network, subscriptions, timers, non-React DOM). It is **not** a generic “after render” hook for business logic that could live in **event handlers** or **derived render** — **`decision-tree.md`**.

Cleanup runs on unmount and **before re-run** when deps change — must be **idempotent** (Strict Mode double-invoke in dev) — **`edge-cases.md`**.

---

## Concurrent features at a glance

React may **interrupt** low-priority renders. **`startTransition`** marks updates as non-urgent. Avoid patterns that assume **fully synchronous** render-to-paint for all subtrees — **`edge-cases.md`**.

---

## SSR and two trees

With SSR, the **server** produces HTML; the **client** must match the **first client render**. Mismatches → **hydration errors** — browser-only values must not appear on first paint — pair **`nextjs-pro`** for RSC boundaries.
