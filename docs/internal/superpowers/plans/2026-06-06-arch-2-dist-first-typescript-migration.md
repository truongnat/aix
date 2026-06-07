# ARCH-2 Dist-First TypeScript Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the `ARCH-2` migration so built `dist/` modules are the runtime source of truth for entrypoints, validation, hooks, scripts, and runtime-oriented tests.

**Architecture:** Keep the existing root shims and command surfaces, but make them delegate to compiled modules under `dist/` after build. Update path-sensitive modules, validation contracts, and tests so runtime assumptions consistently target the built tree instead of the source tree.

**Tech Stack:** Node.js, TypeScript, CommonJS, node:test, npm scripts

---

## File Structure

- Modify: `bin/aih.js`
  Runtime CLI entrypoint; should execute compiled CLI code from `dist/lib/cli-main`.
- Modify: `install.js`
  Legacy root shim; should delegate to `dist/lib/install-legacy`.
- Modify: `install-runtime.js`
  Root runtime installer shim; should delegate to `dist/lib/install-runtime`.
- Modify: `install-cache.js`
  Root cache installer shim; should delegate to `dist/lib/install-cache`.
- Modify: `validate.js`
  Root validation shim; should delegate to `dist/lib/validate/index`.
- Modify: `hooks/core/guard-phase-policy.js`
  Hook runtime bridge; should load compiled policy engine from `dist/lib/policy/engine`.
- Modify: `scripts/generate-policy-docs.js`
  Script entrypoint; should load compiled policy generator from `dist/lib/policy/generator`.
- Modify: `lib/provider-rule-renderer.ts`
  Path-sensitive module; must resolve repo-level `rules/**` correctly when executed from `dist/lib/**`.
- Modify: `lib/validate/constants.ts`
  Required-file contract; must reflect runtime artifact expectations introduced by `dist`-first execution.
- Modify: `lib/validate/contracts.ts`
  Validation text/path contracts; must stop asserting source-only runtime paths where compiled runtime paths are now canonical.
- Modify: `package.json`
  Package surface and verification scripts; must align shipped artifacts and coverage paths with `dist/`.
- Modify: `tsconfig.lib.json`
  Typecheck/build path model; must describe the `dist/` layout consistently.
- Modify: `test/run-tests.js`
  Runtime-oriented integration tests; must require compiled modules and validate built worker/runtime surfaces correctly.
- Modify: `test/insights/event-reader.test.js`
  Runtime-oriented insights test; should import compiled insights modules.
- Modify: `test/insights/summarize.test.js`
  Runtime-oriented insights test; should import compiled summarize module.

### Task 1: Lock the dist-first surface in entrypoints and config

**Files:**
- Modify: `bin/aih.js`
- Modify: `install.js`
- Modify: `install-runtime.js`
- Modify: `install-cache.js`
- Modify: `validate.js`
- Modify: `hooks/core/guard-phase-policy.js`
- Modify: `scripts/generate-policy-docs.js`
- Modify: `package.json`
- Modify: `tsconfig.lib.json`

- [ ] **Step 1: Confirm the failing runtime assumption from the current diff**

Run:

```bash
npm run build
```

Expected: either build passes and leaves unresolved runtime path mismatches for later checks, or it fails in a way that confirms the current migration is incomplete rather than fully working.

- [ ] **Step 2: Keep root/runtime entrypoints pointed at compiled modules**

Ensure these exact requires are present:

```js
// bin/aih.js
const { main } = require("../dist/lib/cli-main");
```

```js
// install.js
const api = require("./dist/lib/install-legacy.js");
```

```js
// install-runtime.js
const api = require("./dist/lib/install-runtime.js");
```

```js
// install-cache.js
const api = require("./dist/lib/install-cache.js");
```

```js
// validate.js
const api = require("./dist/lib/validate/index.js");
```

```js
// hooks/core/guard-phase-policy.js
const { PolicyEngine } = require("../../dist/lib/policy/engine.js");
```

```js
// scripts/generate-policy-docs.js
const { regenerateDocsFromPolicy } = require("../dist/lib/policy/generator.js");
```

- [ ] **Step 3: Align package/build metadata to the compiled runtime surface**

Keep these exact settings aligned:

```json
{
  "files": [
    "bin/",
    "dist/"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "prepack": "npm run build",
    "test": "npm run build && node --test",
    "test:evals": "npm run build && node --test test/evals/",
    "test:coverage": "npm run build && c8 --include=dist/lib/** --check-coverage --lines 65 --functions 65 --branches 55 --statements 65 node --test",
    "typecheck": "tsc -p tsconfig.lib.json"
  }
}
```

And keep `tsconfig.lib.json` modeling the built tree:

```json
{
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist",
    "allowJs": true,
    "checkJs": true,
    "noEmit": true
  }
}
```

- [ ] **Step 4: Run typecheck to verify config and entrypoint edits are coherent**

Run:

```bash
npm run typecheck
```

Expected: PASS. If it fails, fix only `ARCH-2` type or path issues exposed by the `dist`-first surface.

### Task 2: Fix path-sensitive runtime modules and validation contracts

**Files:**
- Modify: `lib/provider-rule-renderer.ts`
- Modify: `lib/validate/constants.ts`
- Modify: `lib/validate/contracts.ts`

- [ ] **Step 1: Write the failing validation/runtime check mentally against the built layout**

Target behavior to enforce:

```ts
const REPO_ROOT = path.resolve(__dirname, "../..");
```

The provider rule renderer must resolve `rules/core/**` and `rules/providers/**` from repo root even when executed from `dist/lib/provider-rule-renderer.js`.

- [ ] **Step 2: Implement the minimal path correction in the provider rule renderer**

Keep this exact compiled-layout-aware root calculation:

```ts
// Adjust for dist/ build layout: compiled files are at dist/lib/, so go up 2 levels to reach repo root
const REPO_ROOT = path.resolve(__dirname, "../..");
```

- [ ] **Step 3: Update validation contracts that now depend on compiled runtime artifacts**

Keep required/contract paths aligned to compiled runtime files where the validator is asserting runtime surfaces:

```ts
// lib/validate/constants.ts
"dist/lib/provider-rule-renderer.js",
```

```ts
// lib/validate/contracts.ts
"dist/lib/command-surface-report.js",
"dist/lib/cli-ui.js",
```

Do not blanket-rewrite unrelated source paths; only move the paths that are meant to describe runtime artifacts.

- [ ] **Step 4: Run validation to verify runtime contracts match the built tree**

Run:

```bash
npm run validate
```

Expected: PASS. If it fails, fix only the stale `lib` vs `dist` contract assumptions that belong to `ARCH-2`.

### Task 3: Move remaining runtime consumers to compiled modules and verify the full loop

**Files:**
- Modify: `test/run-tests.js`
- Modify: `test/insights/event-reader.test.js`
- Modify: `test/insights/summarize.test.js`
- Modify: `test/cli-tests.js`
- Modify: `test/cli-init.test.js`
- Modify: `test/cli-insights.test.js`
- Modify: `test/provider-registry.test.js`
- Modify: `test/compatibility-matrix.test.js`
- Modify: `test/evals/ab-runner.test.js`
- Modify: `test/evals/extended-metrics.test.js`
- Modify: `test/evals/fixture-manager.test.js`
- Modify: `test/evals/llm-judge.test.js`
- Modify: `test/evals/mode-mutations.test.js`
- Modify: `test/evals/scoring.test.js`
- Modify: `test/evals/task-registry.test.js`
- Modify: `test/evals/policy-enforcement.test.js`
- Modify: `test/insights/eval-recommendations.test.js`
- Modify: `test/insights/export.test.js`
- Modify: `test/insights/remote-upload.test.js`
- Modify: `scripts/generate-compatibility-matrix.js`

- [ ] **Step 1: Point runtime integration tests at compiled modules**

Use compiled runtime imports in the touched tests and script surfaces:

```js
require(path.join(repoRoot, "dist", "lib", "runtime-command-catalog"));
require(path.join(repoRoot, "dist", "lib", "validate", "utils.js"));
require(path.join(repoRoot, "dist", "lib", "worker-claude-adapter.js"));
require(path.join(repoRoot, "dist", "lib", "provider-rule-renderer.js"));
require(path.join(repoRoot, "dist", "workers", "registry.js"));
```

```js
const { readEvents, resolveEventsPath } = require("../../dist/lib/insights/event-reader.js");
const { buildInsights } = require("../../dist/lib/insights/index.js");
const { summarizeEvents, formatInsightsText } = require("../../dist/lib/insights/summarize.js");
```

```js
const cliArgs = require(path.join(repoRoot, "dist", "lib", "cli-args.js"));
const cliDetect = require(path.join(repoRoot, "dist", "lib", "cli-detect.js"));
const { loadProviderManifests } = require(path.join(repoRoot, "dist", "lib", "provider-registry.js"));
const { loadRegistry } = require(path.join(repoRoot, "dist", "lib", "evals", "task-registry.js"));
const { buildInsightsExport } = require(path.join(repoRoot, "dist", "lib", "insights", "index.js"));
const { uploadInsights } = require(path.join(repoRoot, "dist", "lib", "insights", "remote-upload.js"));
const { recommendEvalTasks } = require(path.join(repoRoot, "dist", "lib", "insights", "eval-recommendations.js"));
const { PolicyEngine } = require(path.join(repoRoot, "dist", "lib", "policy", "engine.js"));
const generator = require(path.join(repoRoot, "dist", "lib", "policy", "generator.js"));
```

The compatibility matrix generator must also load compiled runtime modules:

```js
const { loadProviderManifests } = require(path.join(repoRoot, "dist", "lib", "provider-registry.js"));
const { loadRegistry } = require(path.join(repoRoot, "dist", "lib", "evals", "task-registry.js"));
```

- [ ] **Step 2: Run the full test suite to verify the compiled runtime surface works**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 3: Re-run the complete verification sequence**

Run:

```bash
npm run build
npm run typecheck
npm test
npm run validate
```

Expected: all commands PASS with exit code 0.

- [ ] **Step 4: Review the final diff for scope discipline**

Run:

```bash
git diff -- bin/aih.js install.js install-runtime.js install-cache.js validate.js hooks/core/guard-phase-policy.js scripts/generate-policy-docs.js scripts/generate-compatibility-matrix.js lib/provider-rule-renderer.ts lib/validate/constants.ts lib/validate/contracts.ts package.json tsconfig.lib.json test/run-tests.js test/cli-tests.js test/cli-init.test.js test/cli-insights.test.js test/provider-registry.test.js test/compatibility-matrix.test.js test/evals/ab-runner.test.js test/evals/extended-metrics.test.js test/evals/fixture-manager.test.js test/evals/llm-judge.test.js test/evals/mode-mutations.test.js test/evals/scoring.test.js test/evals/task-registry.test.js test/evals/policy-enforcement.test.js test/insights/event-reader.test.js test/insights/summarize.test.js test/insights/eval-recommendations.test.js test/insights/export.test.js test/insights/remote-upload.test.js docs/internal/superpowers/specs/2026-06-06-arch-2-dist-first-typescript-migration-design.md docs/internal/superpowers/plans/2026-06-06-arch-2-dist-first-typescript-migration.md
```

Expected: only `ARCH-2` dist-first migration changes plus the approved spec/plan docs.
