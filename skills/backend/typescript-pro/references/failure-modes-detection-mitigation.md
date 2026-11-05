# Failure modes — detection and mitigation (TypeScript)

## Contents

1. [Type errors](#type-errors)
2. [Module resolution](#module-resolution)
3. [Generics and inference](#generics-and-inference)
4. [Build vs editor drift](#build-vs-editor-drift)

---

## Type errors

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **`any` creep** | `noImplicitAny` off | Enable strict incrementally — **`decision-framework-and-trade-offs.md`** |
| **Widening literals** | Lost discriminant unions | `as const`, `satisfies` — **`decision-tree.md`** |

---

## Module resolution

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **`paths` works in IDE, fails in CI** | Different `tsc` cwd | Align `baseUrl`, `rootDir` — **`tsconfig.md`** |
| **Duplicate types** | Conflicting `d.ts` | Single version of `@types/*` — **`versions.md`** |

---

## Generics and inference

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Inference `unknown`/`any`** | Complex generic chains | Explicit type params at boundary — **`type-system.md`** |

---

## Build vs editor drift

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Different TS versions** | CI-only errors | Pin `typescript` + align IDE — **`versions.md`** |
