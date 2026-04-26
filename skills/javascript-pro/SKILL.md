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

### Operating principles

1. **Think Before Coding** — Confirm runtime, module system, and execution context before changing logic. Ask whether the bug is browser-only, Node-only, or shared when unclear.
2. **Simplicity First** — Prefer the smallest control-flow or data-shape fix that matches JavaScript semantics. No speculative abstractions or utility layers.
3. **Surgical Changes** — Touch only the function, module boundary, or runtime guard directly involved in the issue. Do not refactor adjacent style or architecture.
4. **Goal-Driven Execution** — Done = behavior is explained by the runtime model and verified in the actual target environment or test harness.
5. **Runtime truth first** — Distinguish language semantics from bundler/framework behavior before proposing fixes.
6. **Async is explicit** — Promise lifecycles, microtasks, and cancellation assumptions should be written down, not implied.
7. **Module boundaries matter** — ESM/CJS interop, side effects, and top-level execution order are part of the bug surface.
8. **Avoid clever coercion** — Prefer explicit data normalization over relying on implicit truthiness, stringification, or `this` binding side effects.

## Default recommendations by scenario

- **Async bug** — Trace promise creation, awaiting, and error propagation before changing concurrency structure.
- **Module bug** — Confirm `type`, file extension, `exports`, and bundler transform before changing imports.
- **Data bug** — Normalize input at the boundary and keep downstream logic simple.
- **Perf complaint** — Measure allocation, hot loops, or scheduling pressure before reaching for memoization or caching.

## Decision trees

Summary: identify whether the problem is execution order, module loading, mutation/coercion, or environment drift, then apply the smallest runtime-correct fix.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: swallowing promise errors, mixing ESM/CJS without an explicit contract, relying on dynamic `this`, and “fixing” runtime bugs with type assertions or broad rewrites.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### JavaScript execution and module system model (summary)

How lexical scope, event loop ordering, and module loading interact so runtime bugs can be reasoned about, not guessed.

Details: [references/javascript-execution-and-module-system-model.md](references/javascript-execution-and-module-system-model.md)

### Failure modes and mitigation (summary)

Lost promises, unhandled rejections, mutable shared state, and module interop traps, plus the narrow fixes that close them.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

When plain JS is enough, when a stronger contract is needed, and when to isolate mutation or async orchestration.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Versions (summary)

Engine and platform version notes that affect syntax support, built-ins, and module behavior.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Runtime targets, module system, bundler/test harness, and where the behavior occurs.
2. **Runtime analysis** — Explain the actual JavaScript behavior causing the issue.
3. **Solution** — Minimum code change with rationale grounded in runtime semantics.
4. **Verification** — Exact way to reproduce and prove the fix in the target environment.
5. **Residual risks** — Remaining edge cases, environment differences, or interop caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| JavaScript execution and module system model | [references/javascript-execution-and-module-system-model.md](references/javascript-execution-and-module-system-model.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "A promise rejection disappears and the request hangs."
- Trace whether the promise chain is returned or awaited; missing `return` or fire-and-forget work is often the real bug.
- Add the smallest change that preserves error propagation instead of wrapping everything in broad `try/catch`.
- **Verify:** Reproduction now rejects or resolves deterministically, and logs/tests show the expected terminal state.

**Input (tricky):** "CommonJS import works in Jest but fails in Node ESM."
- Confirm `package.json` `"type"`, file extensions, and whether the package exposes conditional `exports`.
- Fix the interop boundary explicitly rather than adding ad hoc transpiler-only behavior.
- **Verify:** The same import path works in the real runtime, not just the test runner.

**Input (cross-skill):** "React hydration breaks because browser-only code runs too early."
- Pair **`react-pro`** for render/hydration boundaries and use **`javascript-pro`** to explain the runtime access to `window` or module side effects.
- Move browser-only work to the correct lifecycle instead of sprinkling global guards everywhere.
- **Verify:** Server render stays deterministic and client hydration no longer diverges.

## Checklist before calling the skill done

- [ ] Runtime targets, module system, and execution context confirmed before proposing a fix (Think Before Coding)
- [ ] Minimum runtime-correct change applied; no speculative utility or abstraction layer added (Simplicity First)
- [ ] Only the affected function/module boundary was changed; unrelated refactors avoided (Surgical Changes)
- [ ] Success criteria and reproduction/verification path are explicit and validated (Goal-Driven Execution)
- [ ] Async error propagation is preserved; no promise is silently dropped
- [ ] ESM/CJS assumptions are stated explicitly when module loading is involved
- [ ] Implicit coercion, `this`, and shared mutable state risks are called out where relevant
- [ ] Residual engine/bundler differences are stated if behavior is environment-specific
