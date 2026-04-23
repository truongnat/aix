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

1. Confirm TypeScript version, `strict` flags, and module system (`ESM`/`CJS`/`NodeNext`).
2. Apply summaries; open `references/` for depth.
3. Respond with **Suggested response format (STRICT)**; call out breaking type changes and migration risks.

### Operating principles

1. **Enable strict mode** — `"strict": true` catches the most bugs; enable per-flag only when migrating incrementally — **`decision-framework-and-trade-offs.md`**.
2. **Prefer `unknown` over `any`** — forces explicit narrowing; reserve `any` for genuine escape hatches with a comment — **`decision-tree.md`**.
3. **Type at boundaries** — strongest types at external input (API responses, user input, env vars); let inference flow inward — **`typescript-typechecking-and-boundaries-system-model.md`**.
4. **Narrow explicitly** — type guards, discriminated unions, `satisfies` rather than blind assertions — **`decision-tree.md`**.
5. **Generics express relationships** — a generic `<T>` should connect input to output — **`type-system.md`**.
6. **Avoid type gymnastics** — complex mapped/conditional types live in well-documented modules — **`anti-patterns.md`**.

### Typechecking flow and boundaries (summary)

Parse/check/emit mental model, structural typing, IO boundaries — **`typescript-typechecking-and-boundaries-system-model.md`**.

Details: [references/typescript-typechecking-and-boundaries-system-model.md](references/typescript-typechecking-and-boundaries-system-model.md)

### Failure modes — detection and mitigation (summary)

`any` creep, resolution drift, generic inference, CI vs editor TS — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Strictness ramp, `satisfies` vs annotation, brands vs runtime validation, project references — **`decision-framework-and-trade-offs.md`**, **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

No invented `compilerOptions`; evidence from official docs/version — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Type system depth (summary)

Generics, mapped/conditional types, utilities — **`type-system.md`**.

Details: [references/type-system.md](references/type-system.md)

### Compiler configuration (summary)

`target`, `module`, `moduleResolution`, `paths`, `isolatedModules`, declarations — **`tsconfig.md`**.

Details: [references/tsconfig.md](references/tsconfig.md)

### Tips and tricks (summary)

`satisfies`, `as const`, discriminated unions, narrowing, module augmentation — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Excess property checks, variance, `isolatedModules`, declaration merging, `noUncheckedIndexedAccess` — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Anti-patterns (summary)

`as` silencing, `any` in public APIs, path alias mismatch — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

`@types` lag, TS release alignment — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — TS version, `strict` flags, `module`/`moduleResolution`, monorepo vs single package.
2. **Problem / goal** — Type error, API design typing, migration step, or config change.
3. **System design** — Where types flow (boundary → core) — **`typescript-typechecking-and-boundaries-system-model.md`**.
4. **Decision reasoning** — `satisfies` vs annotation, strict ramp, project references — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — TS snippets or `tsconfig` diff; align with **`quality-validation-and-guardrails.md`** (no invented flags).
6. **Trade-offs** — Readability vs advanced conditional types; strictness vs migration speed.
7. **Failure modes** — Resolution, widening, version skew — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Runtime validation still needed; hand off to **`react-pro`** / **`nestjs-pro`** / **`javascript-pro`** when appropriate.

## Resources in this skill

| Topic | File |
|-------|------|
| **Typechecking & boundaries model** | [references/typescript-typechecking-and-boundaries-system-model.md](references/typescript-typechecking-and-boundaries-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Type system depth | [references/type-system.md](references/type-system.md) |
| Compiler config | [references/tsconfig.md](references/tsconfig.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Version notes | [references/versions.md](references/versions.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick example

### 1 — Simple (common)

**Input:** `Type 'string | undefined' is not assignable to type 'string'` after `strictNullChecks`.  
**Expected output:** Full **Suggested response format (STRICT)** — guards, `?.`, `??`, when `!` is unacceptable.

### 2 — Tricky (edge case)

**Input:** `satisfies` vs `: Config` vs `as Config` for a large config object.  
**Expected output:** Prefer `satisfies`; widening vs escape hatch — **`decision-tree.md`**, **`decision-framework-and-trade-offs.md`**.

### 3 — Cross-skill

**Input:** React props typed `any` for `children` and events.  
**Expected output:** **`typescript-pro`** for `ReactNode`, `ComponentProps`, events; **`react-pro`** for idiomatic component API.

## Checklist before calling the skill done

- [ ] `strict: true` (or explicit flags) policy clear; no silent `any` — **`quality-validation-and-guardrails.md`**.
- [ ] Generics constrain and connect types — **`type-system.md`**.
- [ ] `module`/`moduleResolution` match the build tool — **`tsconfig.md`**.
- [ ] Narrowing via unions/guards; no blind `as` — **`decision-tree.md`**.
- [ ] `import type` when `isolatedModules` — **`tsconfig.md`** / **`edge-cases.md`**.
- [ ] External input validated at runtime when shape matters — **`typescript-typechecking-and-boundaries-system-model.md`**.
- [ ] **`integration-map.md`** used for cross-skill splits.
