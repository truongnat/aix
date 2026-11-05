# Decision framework and trade-offs (React)

## Contents

1. [Derived state vs stored state](#derived-state-vs-stored-state)
2. [Local vs lifted vs server state](#local-vs-lifted-vs-server-state)
3. [Controlled vs uncontrolled inputs](#controlled-vs-uncontrolled-inputs)
4. [Transitions and urgency](#transitions-and-urgency)
5. [Colocation vs global store](#colocation-vs-global-store)

Use **`decision-tree.md`** for quick branches.

---

## Derived state vs stored state

| Prefer **derive in render** | Prefer **`useState` / reducer** |
|-----------------------------|----------------------------------|
| Pure function of props + existing state | User intent, async steps, undo |

**Trade-off:** duplicating derived values in state causes **sync bugs** — **`failure-modes-detection-mitigation.md`**.

---

## Local vs lifted vs server state

| Source | Fit |
|--------|-----|
| **URL / server** | Shareable truth; avoid duplicating in client without reason — **`nextjs-pro`** |
| **Colocated** | Leaf UI toggles |
| **Store (Zustand/Redux)** | Cross-cutting client concerns; document boundaries |

**Trade-off:** global stores increase **rerender fan-out** — **`tips-and-tricks.md`**.

---

## Controlled vs uncontrolled inputs

Pick **one** model per field; mixing causes **cursor jumps** and inconsistent sources of truth — **`components-and-jsx.md`**.

---

## Transitions and urgency

`startTransition` improves **responsiveness** for typing while heavy lists update — it does not remove work; still optimize the slow path — **`edge-cases.md`**.

---

## Colocation vs global store

Default **colocate**; lift only when multiple distant consumers need the same state. Prefer **TanStack Query** (or similar) for **server state** instead of mirroring in Redux without invalidation — **`tips-and-tricks.md`**.
