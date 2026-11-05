# TypeScript — typechecking flow and boundary model

## Contents

1. [Compiler pipeline (mental model)](#compiler-pipeline-mental-model)
2. [Structural typing](#structural-typing)
3. [Boundaries](#boundaries)
4. [Where `tsconfig` matters](#where-tsconfig-matters)

Pair with **[type-system.md](type-system.md)** and **[tsconfig.md](tsconfig.md)**.

---

## Compiler pipeline (mental model)

```
Source → parse → bind → check (types) → emit (or emit-only in some tools)
```

**Type errors** are **check** phase — **`failure-modes-detection-mitigation.md`**.

---

## Structural typing

Compatibility is by **shape**, not declaration site — surprises when two types look different but structurally match — **`edge-cases.md`**.

---

## Boundaries

| Boundary | Pattern |
|----------|---------|
| **JSON / HTTP** | Parse + schema (`zod`, etc.) → narrow `unknown` — **`decision-tree.md`** |
| **Third-party JS** | `d.ts` or minimal ambient types — **`versions.md`** |

---

## Where `tsconfig` matters

`strict`, `moduleResolution`, `paths` change **what** resolves and **how** strict checks are — **`tsconfig.md`**; **do not invent** flags — **`quality-validation-and-guardrails.md`**.
