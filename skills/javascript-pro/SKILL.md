---
name: javascript-pro
description: |
  Production-grade JavaScript: architecture and maintainability, runtime semantics (event loop, microtasks, ESM/CJS graph), async flows, performance — plus execution/module model, failure modes (lost Promises, `this`, pollution, FP dates, dual-package), trade-offs (JS vs TypeScript, mutability), quality guardrails (engine-accurate features; no sloppy security claims).

  Use this skill when implementing or reviewing JavaScript/TypeScript application logic at the language/runtime level, debugging tricky behavior, or handling edge cases in browser/Node projects.

  Combine with **`testing-pro`**, **`security-pro`**, **`typescript-pro`**, **`code-packaging-pro`**, and stack skills (**`react-pro`**, **`nestjs-pro`**, **`nextjs-pro`**) per integration map.

  Triggers: "javascript", "js", "event loop", "promise", "closure", "this", "prototype", "hoisting", "microtask", "edge case", "tip", "trick", "await", "async", "TypeError", "ReferenceError", "undefined is not a function", "ESM", "CommonJS", "cjs", "mjs", "import.meta".

metadata:
  short-description: JavaScript — runtime model, async, modules, failure modes, edge cases
  content-language: en
  domain: javascript
  level: professional
---

# JavaScript (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [MDN JavaScript docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript), [ECMAScript specification](https://tc39.es/ecma262/), and [Node.js docs](https://nodejs.org/docs/latest/api/) for API truth; this skill encodes **predictable runtime behavior**, **explicit contracts**, and **failure-aware** patterns — not syntax trivia alone.

## Boundary

**`javascript-pro`** owns **language and runtime semantics** (execution order, coercion, modules, async). **`typescript-pro`** owns **static types** configuration; **`react-pro`** / **`nestjs-pro`** own **framework** lifecycles; **`security-pro`** owns **threat modeling** beyond language hygiene.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`testing-pro`** | Regression tests for async, timers, mocks, ESM/CJS runners |
| **`security-pro`** | `eval`, prototype pollution, unsafe deserialization |
| **`typescript-pro`** | Types, `strict`, narrowing — stronger guarantees |
| **`code-packaging-pro`** | `exports`, dual publish, conditional exports |
| **`react-pro`** | Client bundles, hydration, browser APIs |
| **`nestjs-pro`** / **`nextjs-pro`** | Server/framework-specific JS patterns |

## When to use

- Module/service-level logic, not only formatting.
- Runtime correctness, readability, production safety.
- Async ordering, mutation, scope/`this` bugs.
- ESM/CJS interop and engine target alignment.

## When not to use

- **Pure TypeScript config** without JS semantics — **`typescript-pro`**.
- **CSS/HTML-only** questions — other skills.

## Required inputs

- **Runtime targets** (Node version, browserslist, bundler).
- **Module system** (ESM/CJS) and **strict** expectations.

## Expected output

Follow **Suggested response format** strictly.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** versions, `package.json` `"type"`, bundler, test runner module mode. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.