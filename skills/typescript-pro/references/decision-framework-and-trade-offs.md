# Decision framework and trade-offs (TypeScript)

## Contents

1. [Strictness ramp](#strictness-ramp)
2. [`satisfies` vs annotation](#satisfies-vs-annotation)
3. [Branded types vs runtime validation](#branded-types-vs-runtime-validation)
4. [Monorepo project references](#monorepo-project-references)

See **`decision-tree.md`** for narrowing and `any`.

---

## Strictness ramp

| Big-bang strict | Incremental |
|-----------------|---------------|
| Fastest end state | Lower migration shock |

**Trade-off:** short pain vs long partial strictness — document per package — **`tsconfig.md`**.

---

## `satisfies` vs annotation

`satisfies` preserves **literal inference** while checking shape — prefer for config-like objects — **`decision-tree.md`**.

---

## Branded types vs runtime validation

Compile-time brands **do not validate at runtime** — pair with schema at IO boundary — **`type-system.md`**.

---

## Monorepo project references

Project references improve **incremental** builds but need consistent `composite` — **`tsconfig.md`** — **`integration-map.md`** for cross-skill splits.
