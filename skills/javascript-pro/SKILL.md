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

1. Confirm versions, `package.json` `"type"`, bundler, test runner module mode.
2. Apply summaries; open `references/`; defer types to **`typescript-pro`** when static guarantees dominate.
3. Respond with **Suggested response format**; include **failure modes** for async and security-sensitive code.

### Operating principles

1. **Execution order first** — Event loop, microtasks, `await` — **`javascript-execution-and-module-system-model.md`**.
2. **Prefer explicitness** — `===`, avoid surprise coercion — **`tips-and-tricks.md`**.
3. **Constrain mutable shared state** — Narrow owners — **`decision-framework-and-trade-offs.md`**.
4. **Validate at boundaries** — JSON, dates, numbers — **`failure-modes-detection-mitigation.md`**.
5. **Tests lock regressions** — **`testing-pro`**.

### JavaScript execution and module system model (summary)

Event loop, ESM/CJS, strict mode — **`javascript-execution-and-module-system-model.md`**.

Details: [references/javascript-execution-and-module-system-model.md](references/javascript-execution-and-module-system-model.md)

### Failure modes — detection and mitigation (summary)

Lost Promises, races, `this`, pollution, FP/date/JSON — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

JS vs TS maturity, mutability vs perf, async API shape — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Shipped features vs proposals; module-mode examples — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### High-level tips and tricks (summary)

Normalization, own keys, async hygiene — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### JavaScript edge cases (summary)

Scheduling, `this`, coercion, modules — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision tree (summary)

Module/async/mutation/strict — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Coercion, lost Promises, `this` — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

**`typescript-pro`**, **`testing-pro`**, **`security-pro`**, **`react-pro`**, **`code-packaging-pro`**, … — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions and runtimes (summary)

ECMAScript target, Node LTS — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Engines, module mode (ESM/CJS), bundler/test runner constraints.
2. **Problem / goal** — Bug, review, refactor, interop issue.
3. **System design** — Where behavior lives: loop phase, module graph, mutation boundary — **`javascript-execution-and-module-system-model.md`**.
4. **Decision reasoning** — Async/style/mutation/TS escalation — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — JS snippets valid for stated runtime — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Clever vs explicit; perf vs immutability; dual-package complexity.
7. **Failure modes** — Ordering, coercion, pollution, interop — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Compatibility matrix; **`typescript-pro`**, **`security-pro`**, **`testing-pro`** handoffs.

## Resources in this skill

| Topic | File |
|-------|------|
| **Execution & module model** | [references/javascript-execution-and-module-system-model.md](references/javascript-execution-and-module-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Review JS service for hidden async bugs before release.  
**Expected output:** Full **Suggested response format** — microtasks/`await`, lost Promise patterns, tests — **`failure-modes-detection-mitigation.md`**.

### 2 — Tricky (edge case)

**Input:** `forEach` + async — DB writes incomplete in prod.  
**Expected output:** Fire-and-forget hazard; `for…of` / bounded `Promise.all`; **failure mode** named — **`edge-cases.md`**, **`anti-patterns.md`**.

### 3 — Cross-skill

**Input:** Node 18 ESM + old Jest CJS — imports break.  
**Expected output:** **`code-packaging-pro`** `exports`; test runner config; **`typescript-pro`** if TS — dual-package hazards — **`integration-map.md`**.

## Checklist before calling the skill done

### Runtime & modules

- [ ] Targets and **ESM/CJS** mode confirmed — **`versions.md`**.
- [ ] Predictable behavior over clever syntax — **`decision-framework-and-trade-offs.md`**.

### Depth

- [ ] Tip/trick **and** edge-case path checked — **`tips-and-tricks.md`**, **`edge-cases.md`**.
- [ ] Concrete code or test guidance — **`quality-validation-and-guardrails.md`**.

### Risks & handoff

- [ ] Compatibility and regression risks explicit — **`failure-modes-detection-mitigation.md`**.
- [ ] Async ordering failure mode named when relevant — **`javascript-execution-and-module-system-model.md`**.
- [ ] Numeric/`Date` assumptions explicit — **`edge-cases.md`**.
- [ ] **`typescript-pro`** / **`security-pro`** / **`testing-pro`** when scope exceeds raw JS — **`integration-map.md`**.
