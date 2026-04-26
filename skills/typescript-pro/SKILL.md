---
name: typescript-pro
description: |
  Production-grade TypeScript: typechecking and boundary model, failure modes (resolution drift, `any` creep, build vs editor TS version), decision trade-offs (strictness ramp, `satisfies` vs annotation, branded types vs runtime validation), quality guardrails (no invented `compilerOptions`; cite TS version and official docs).

  Use this skill when the user works on TypeScript, tsconfig, type inference, generics, mapped/conditional/template-literal types, utility types (Partial, Required, Pick, Omit, Record, ReturnType, etc.), declaration files (.d.ts), type narrowing, discriminated unions, module resolution, path aliases, strict null checks, type guards, satisfies operator, const assertions, or migrating JavaScript to TypeScript.

  Combine with **`javascript-pro`** for runtime JS semantics, **`react-pro`** / **`nextjs-pro`** / **`nestjs-pro`** for framework typing, **`testing-pro`** for test utility typing.

  Triggers: "TypeScript", "tsconfig", "type error", "TS2322", "TS2532", "TS18048", "generic", "interface", "type alias", "infer", "conditional type", "mapped type", "utility type", "ReturnType", "Partial", "Pick", "Omit", "satisfies", "as const", ".d.ts", "declaration file", "strict mode", "noImplicitAny", "exactOptionalPropertyTypes", "module resolution", "path alias", "NodeNext", "verbatimModuleSyntax", "tsc", "type guard", "discriminated union", "never", "unknown", "keyof", "typeof", "branded type".

metadata:
  short-description: TypeScript — type flow, tsconfig, failure modes, strictness, migration
  content-language: en
  domain: typescript
  level: professional
---

# TypeScript (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [TypeScript docs](https://www.typescriptlang.org/docs/) for language reference; this skill encodes **type system discipline**, **compiler configuration**, **failure modes**, and **edge-case awareness** — not a full duplicate of the handbook. Confirm **TypeScript version**, **`tsconfig` `strict` settings**, and **module system** (`ESM` vs `CJS` / `NodeNext`) when known.

## Boundary

**`typescript-pro`** owns **types, narrowing, generics, and `tsconfig` semantics** at the language level. **`javascript-pro`** owns **runtime JS** behavior when the bug is not a type issue. Framework skills own **idiomatic patterns** for React/Nest/Next wiring.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`javascript-pro`** | Runtime behavior (closures, prototypes, async) underlies the issue |
| **`react-pro`** | TSX, props, hook generics |
| **`nextjs-pro`** | App Router types, `metadata`, server/client boundaries |
| **`nestjs-pro`** | Decorator metadata, controller/service DTO types |
| **`testing-pro`** | Mock typing, helper generics |

## When to use

- Designing interfaces, type aliases, generics, and utility types for domain models.
- Debugging type errors: excess property checks, `never`, widening, narrowing, contextual typing.
- Configuring `tsconfig.json` for strict correctness and module compatibility.
- Writing declaration files for JS libraries or augmenting third-party types.
- Migrating a JavaScript codebase to TypeScript incrementally.

## When not to use

- **Pure runtime** bug with no type angle — **`javascript-pro`** or stack skill.
- **Bundler-only** config (e.g. Vite plugins) as primary topic — framework/build skill; pair here for `moduleResolution` alignment.

## Required inputs

- **TypeScript version** (or `package.json` constraint).
- **`tsconfig.json`** relevant flags when debugging resolution/strict errors.

## Expected output

Follow **Suggested response format (STRICT)** — context through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** TypeScript version, `strict` flags, and module system (`ESM`/`CJS`/`NodeNext`). → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — State TS version, `strict` flags, and module system before any type solution. Ask when unknown.
2. **Simplicity First** — Minimum type change that resolves the error; avoid overfitting generics or utility type chains.
3. **Surgical Changes** — Only modify types directly related to the request. No wholesale `any` removal campaigns or unrelated `tsconfig` changes.
4. **Goal-Driven Execution** — Done = `tsc --noEmit` passes with existing strict flags; no `as` assertions introduced as workarounds.
5. **Narrow at boundaries** — Use `unknown` at trust boundaries; narrow explicitly with guards. Never widen to `any` as a fix.
6. **Prefer inference** — Let TypeScript infer what it can; annotate only where inference fails or where clarity requires it.
7. **No invented `compilerOptions`** — Never suggest flags that don't exist in the target TS version; cite TS docs.
8. **Version-gated features** — `satisfies`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` have minimum TS versions; state the requirement.

### Type system model (summary)

Structural typing, widening/narrowing, contextual typing, declaration merging, conditional and mapped types, infer keyword — how the type checker flows through an expression.

Details: [references/type-system.md](references/type-system.md)

### Typechecking and boundary model (summary)

How TypeScript checks across module boundaries, declaration files, module resolution (`NodeNext`, `bundler`), and why editor TS ≠ `tsc` causes drift.

Details: [references/typescript-typechecking-and-boundaries-system-model.md](references/typescript-typechecking-and-boundaries-system-model.md)

### Failure modes and mitigation (summary)

`any` creep, resolution drift, build vs editor TS version mismatch, `strictNullChecks` bypass patterns.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### tsconfig deep-dive (summary)

`strict`, `moduleResolution`, `paths`, `verbatimModuleSyntax`, `isolatedModules`, `exactOptionalPropertyTypes` — when and why to enable each flag.

Details: [references/tsconfig.md](references/tsconfig.md)

## Suggested response format

1. **Context** — TypeScript version, `strict` flags in effect, module system (`ESM`/`CJS`/`NodeNext`).
2. **Type analysis** — Why the error occurs: widening, narrowing failure, inference gap, or declaration mismatch.
3. **Solution** — Minimum type change with before/after showing the narrowing or annotation.
4. **Trade-offs** — Runtime guarantees vs compile-time only; when a type assertion is unavoidable and why.
5. **Residual risks** — Version-specific behavior, `strict` flag dependencies, module resolution caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Type system model | [references/type-system.md](references/type-system.md) |
| Typechecking and boundary model | [references/typescript-typechecking-and-boundaries-system-model.md](references/typescript-typechecking-and-boundaries-system-model.md) |
| tsconfig deep-dive | [references/tsconfig.md](references/tsconfig.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "TS2322: Type 'string | undefined' is not assignable to type 'string'."
- `strictNullChecks` is on; the value may be `undefined` at this call site.
- **Fix:** Narrow with a guard (`if (value !== undefined)`) or provide a default (`value ?? ''`). Do not use `as string` unless you have runtime proof.
- **Verify:** `tsc --noEmit` passes; no `as` assertion hides the undefined path.

**Input (tricky):** "My generic function loses type information — returns `unknown` instead of the expected type."
- Root cause: Inference context is insufficient; TypeScript widens to `unknown` or `{}` when it can't infer the type argument.
- **Fix:** Add an explicit type parameter at the call site, or add a constraint (`T extends Record<string, unknown>`) that gives the checker enough to work with.
- **Verify:** Hover type in editor matches expected; no `as` needed at the call site.

**Input (cross-skill):** "I need strict typing for React props with optional and required fields."
- Use `interface` with required fields and `?` for optional; avoid `Partial<T>` on the whole props type (hides required intent).
- Pair **`react-pro`** for component patterns; **`javascript-pro`** when the bug has a runtime (not type) dimension.
- **Verify:** TS errors at the JSX call site for missing required props; optional props accept `undefined`.

## Checklist before calling the skill done

- [ ] TypeScript version and `strict` flags confirmed before writing types (Think Before Coding)
- [ ] Minimum type change applied — no over-engineered generics (Simplicity First)
- [ ] Only types related to the request modified — no unrelated `tsconfig` changes (Surgical Changes)
- [ ] `tsc --noEmit` passes with existing strict config (Goal-Driven Execution)
- [ ] No `any` introduced; no `as` assertion without documented justification
- [ ] `unknown` used at trust boundaries, narrowed explicitly
- [ ] No invented `compilerOptions`; feature availability verified for target TS version
- [ ] Module resolution (`NodeNext`, `bundler`) alignment confirmed if relevant