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