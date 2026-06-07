# ai-engineering-harness — Deep Project Review

> Generated: 2026-06-07  
> Reviewer: Claude Code (claude-sonnet-4-6)  
> Scope: full codebase audit — architecture, code quality, testing, CI/CD, security, DX

---

## Executive Summary

`ai-engineering-harness` is a well-conceived workflow discipline kit for AI coding agents. The core idea — enforce a structured `Start → Discuss → Plan → Run → Verify → Ship → Remember` loop via markdown artifacts, phase guards, and provider-specific command surfaces — is solid and the implementation reflects genuine effort. However, a mid-migration architectural fault runs through the entire codebase: the TypeScript in-process backend is **partially ported**, leaving `update` and `uninstall` still shelling out to `aih.sh` while `install`, `status`, and `doctor` have been fully ported. This creates an inconsistent, shell-dependent surface for two critical lifecycle operations. Beyond that, there are meaningful gaps in policy-engine wiring, test coverage, CI correctness, and several security-adjacent concerns. The sections below describe each finding with severity rating, location, and a concrete recommendation.

---

## Severity Legend

| Label | Meaning |
|---|---|
| 🔴 **Critical** | Breaks core functionality, causes data loss, or introduces a hard security vulnerability |
| 🟠 **High** | Material correctness gap, cross-platform breakage, or meaningfully degrades reliability |
| 🟡 **Medium** | Technical debt, inconsistency, or suboptimal design that will hurt maintainability |
| 🟢 **Low / Polish** | Minor quality improvements, DX enhancements, or style suggestions |

---

## 1. Architecture

### 🔴 In-process port is incomplete — `update` and `uninstall` still shell out

**Location:** `lib/cli-commands/update.ts:78`, `lib/cli-commands/uninstall.ts:101`

Both commands call `runAihSh(packRoot, ...)` which spawns the bundled `aih.sh` shell script. This means:
- On Windows without Git Bash / WSL, both commands throw `SH_MISSING` and fail.
- The `update` wizard calls `runAihSh` even though `lib/backend/update.ts:runUpdate()` already exists and is correct.
- The `uninstall` command has no equivalent in-process backend at all.

The already-merged commit series (`fix: wire install and diagnostics through in-process backend`) leaves two commands behind. The README markets cross-platform support but two of three mutating operations are shell-only.

**Recommendation:**
1. Wire `lib/cli-commands/update.ts` to call `runUpdate()` from `lib/backend/update.ts` (the implementation already exists — the wizard just needs to call it instead of `runAihSh`).
2. Implement `lib/backend/uninstall.ts` mirroring the `run_uninstall` logic in `aih.sh` and wire it into the CLI command.

---

### 🔴 Policy engine exists but is never invoked from the CLI

**Location:** `lib/policy/engine.ts`, `lib/backend/harness-skeleton.ts:skeletonPoliciesJson()`

`PolicyEngine.shouldBlock()` is a full deterministic enforcement system. The skeleton installer writes a `policies.json` to `.harness/`. But no CLI command (`harness-run`, `harness-ship`, etc.) imports or calls the policy engine. The phase gates defined in the default `policies.json` (`phase-gate-plan`, `phase-gate-verify`, `test-first-enforcement`) are dead letter — they exist on disk but nothing reads them at execution time.

**Recommendation:**  
Add a policy-check step to the relevant commands (at minimum `harness-run` and `harness-ship`). Pass the current command name and state to `PolicyEngine.shouldBlock()` and block or warn accordingly. Until this is wired in, the feature is user-visible documentation but not functional enforcement.

---

### 🟠 `scope-guard` default policy fires on every file edit

**Location:** `lib/backend/harness-skeleton.ts:skeletonPoliciesJson()`, policy rule `scope-guard`

```json
{
  "id": "scope-guard",
  "conditions": [{ "type": "file_pattern", "operator": "matches", "value": "**" }],
  "action": { "type": "warn", "message": "Edit may be outside approved scope" }
}
```

`**` matches every file path. Once the policy engine is wired in, this default will warn on *every single file edit*, which is so noisy it trains users to ignore warnings or simply delete `policies.json`. This defeats the purpose of the policy system.

**Recommendation:** Change the default `scope-guard` rule to a narrower pattern (e.g., `src/**`, `lib/**`) or remove it from the default skeleton. Document it as an example users can customize rather than a live default.

---

### 🟡 PROVIDER_IDS duplicated across two modules

**Location:** `lib/provider-registry.ts:8`, `lib/cli-providers.ts:ACTIVE_PROVIDERS`

`provider-registry.ts` hardcodes `["claude", "cursor", "codex", "gemini"]`. `cli-providers.ts` maintains `ACTIVE_PROVIDERS` with the same four. `install-runtime.ts:ALL_RUNTIMES` adds `"generic"`. Any new provider requires three separate edits with no compile-time check that they stay in sync.

**Recommendation:** Make `ACTIVE_PROVIDER_IDS` from `cli-providers.ts` the single source of truth. Have `provider-registry.ts` import and re-use that array instead of maintaining its own.

---

### 🟡 `installRuntime` has a dead `parseArgs` function

**Location:** `lib/install-runtime.ts:parseArgs()`

The module exports `installRuntime()` as a library function. The `parseArgs()` function near the top (lines ~50–80) is never called — it's a shell-script-era artefact from when the file was also used as a standalone CLI script. Dead code adds noise and confusion.

**Recommendation:** Remove `parseArgs()` and the unused `usage()` function from `install-runtime.ts`.

---

### 🟡 `lib/RUNTIME_CATALOG_REFACTORING.md` is compiled/shipped

**Location:** `lib/RUNTIME_CATALOG_REFACTORING.md`

An internal refactoring planning document sits inside the `lib/` source tree. It is not excluded by `.gitignore`, `tsconfig.lib.json`, or the `files` array in `package.json`. If users `npm install` the package and inspect `dist/`, this document will be present and confusing.

**Recommendation:** Move it to `docs/internal/` (already excluded from npm by `!docs/internal/`) or delete it.

---

## 2. Code Quality

### 🟠 Systemic `@ts-ignore` usage for intra-package JS imports

**Count:** 30+ `@ts-ignore - JS file with checkJs` comments across the TypeScript source

Examples: `lib/install-runtime.ts:12`, `lib/cli-commands/install.ts:5–8`, `lib/validate/contracts.ts:26`

TypeScript files import `.js` counterparts and suppress the type error. This means the type checker does not validate the interface between these modules. Bugs at the JS/TS boundary won't be caught by `tsc`.

**Root cause:** Some source files (`file-operations`, `cli-ui`, `runtime-command-catalog`, `workers/registry`) are plain JavaScript and not included in `tsconfig.lib.json`.

**Recommendation:** Convert the remaining JS files to TypeScript (they're relatively small utility files) and remove the `@ts-ignore` suppressions. Alternatively, add `.d.ts` declaration files for each JS module and include them in `tsconfig.lib.json`.

---

### 🟠 Dynamic `require()` inside TypeScript module bodies

**Location:** `lib/cli-commands/diagnostics.ts:34`, `lib/cli-commands/update.ts:22`, `lib/cli-commands/uninstall.ts:24`

```typescript
const ui = require("../cli-ui");
```

This dynamic `require()` inside a function body bypasses TypeScript's module resolution entirely, prevents tree-shaking, and produces `any` types for all calls into `ui`. The comment `// @ts-ignore - ui will be available when this is called from CLI context` indicates this is known but treated as acceptable.

**Recommendation:** Import `cli-ui` at module level like the other dependencies. If circular dependency is the concern (a CLI module importing a UI module that imports back), restructure to break the cycle rather than deferring to runtime.

---

### 🟡 `ref` option parsed but never used

**Location:** `lib/cli-args.ts:options.ref`, `lib/cli-commands/install.ts`

`parseArgv` parses `--ref` and stores it in `options.ref`, but inspection of all callers shows `ctx.ref` is never passed to `runInstall`, `installRuntime`, or any other install function. Users can pass `--ref` and nothing happens.

**Recommendation:** Either implement `--ref` (to install from a specific git ref) or remove it from `parseArgv` and the help text to avoid false promises.

---

### 🟡 `install-legacy.ts` deprecation not surfaced at runtime

**Location:** `lib/install-legacy.ts:1–30`, `lib/cli-commands/install.ts`

The module has a lengthy deprecation comment but emits no warning when called. The "manual" provider path in `runInstall` calls `installHarness()` from `install-legacy.ts` without warning the user this path is scheduled for removal in v1.1.0.

**Recommendation:** Add `process.stderr.write("[DEPRECATED] manual install path will be removed in v1.1.0...\n")` at the top of `installHarness()` so users and CI logs surface the deprecation.

---

### 🟡 `bannerVerb` couples display concerns to install context

**Location:** `lib/backend/install-orchestrator.ts:InstallContext.bannerVerb`

`bannerVerb` controls whether the printed banner says `"install"` or `"update"`. This is pure UI state leaking into a data-transfer object. The install orchestrator should be agnostic about what its caller labels the operation.

**Recommendation:** Remove `bannerVerb` from `InstallContext`. Let the callers (`runInstall` vs `runUpdate`) pass a label string to a wrapper that prints the banner before calling the shared logic.

---

### 🟡 `RegExp` constructed directly from policy JSON values

**Location:** `lib/policy/engine.ts:evaluateCommandCondition()`, `evaluatePhaseCondition()`

```typescript
case "matches":
  return new RegExp(value).test(command);
```

`value` comes directly from a policy JSON file on disk. An adversarially crafted or accidentally malformed pattern (`(a+)+`) causes catastrophic backtracking (ReDoS). In the current design policy files are developer-authored, but if this evolves toward user-configurable rules this will matter.

**Recommendation:** Wrap `new RegExp(value)` in a try/catch and reject rules with invalid patterns at `loadPolicySet()` time. Consider sanitizing or rejecting patterns containing catastrophic structures if policy files become user-editable.

---

## 3. Testing

### 🟠 No tests for the policy engine

**Location:** `lib/policy/engine.ts`, `lib/policy/generator.ts`, `lib/policy/schema.ts`

These three files (~600 lines total) have no corresponding test files. The policy engine is a core enforcement primitive, and `globToRegExp` in particular has edge-case behavior (e.g., escaped regex metacharacters mixed with `**` patterns) that is non-trivial to verify by inspection.

**Recommendation:** Add `test/policy-engine.test.js` covering at minimum:
- `globToRegExp` with `**`, `*`, `?`, and escaped metacharacters
- `evaluate()` for each condition type and operator
- `shouldBlock()` with blocking vs. warning vs. allow rules
- `loadPolicySet()` with a valid and an invalid JSON file

---

### 🟠 `callLlmJudge` has no timeout

**Location:** `lib/evals/llm-judge.ts:callLlmJudge()`

```typescript
const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});
```

No `AbortSignal` / `signal` with timeout. CI runs the eval runner (`aih eval run sample-bugfix`) which ultimately calls this. If the judge endpoint is slow or unreachable, CI hangs until GitHub's job timeout.

**Recommendation:**
```typescript
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 30_000);
try {
  const response = await fetch(endpoint, { signal: controller.signal, ... });
} finally {
  clearTimeout(timer);
}
```

---

### 🟠 Tests run against `dist/` — build failure cascades to all test failures

**Location:** `test/run-tests.js:10-12`

```javascript
const validateApi = require(path.join(repoRoot, "dist", "lib", "validate", "index.js"));
const installApi = require(path.join(repoRoot, "dist", "lib", "install-legacy.js"));
```

The test suite imports from `dist/`. If `tsc` fails for any reason (e.g., TypeScript API change, missing devDep), every test fails with a module-not-found error rather than a helpful type error. The `npm test` script (`npm run build && node --test`) makes this explicit, but the failure message in CI is misleading.

**Recommendation:** Consider a smoke-test step that verifies `dist/` exists before running tests, with a clear error message. Alternatively, use `ts-node` or `tsx` in test mode to avoid the compile-then-test two-step for faster iteration.

---

### 🟡 Coverage threshold is low and platform-limited

**Location:** `.github/workflows/ci.yml:check-lib-coverage`, `package.json:test:coverage`

Coverage thresholds are 65% lines/functions/statements and 55% branches. The coverage check only runs on `ubuntu-latest` + `node: 20`. Windows and macOS builds skip coverage entirely, so cross-platform regressions in code paths won't be caught by the coverage gate.

**Recommendation:**
- Raise targets to at least 75% lines / 70% branches over the next two milestones.
- Enable coverage on all platforms or at least add a matrix include for `windows-latest` + `node: 20`.

---

### 🟡 Eval CI step may make live LLM API calls

**Location:** `.github/workflows/ci.yml:Run eval regression`

```yaml
- name: Run eval regression
  run: node bin/aih.js eval run sample-bugfix --yes
```

`useLlmJudge` defaults to `true` in `parseArgv`. If `LLM_JUDGE_ENDPOINT` (or equivalent env var) is set in the CI environment, this step will make external API calls with unbounded latency. Even without an endpoint, the code attempts the call and falls back.

**Recommendation:** Add `--no-llm-judge` to the CI invocation to explicitly disable the LLM fallback. Reserve LLM-judge evals for a separate nightly / scheduled workflow.

---

### 🟡 `makeTempRepoCopy()` copies the full source tree on every test

**Location:** `test/run-tests.js:makeTempRepoCopy()`

The function uses `fs.cpSync` with a filter excluding only `.git`, `node_modules`, and `artifacts`. This copies the full docs tree, all provider rule files, agent-system markdown, etc. — potentially hundreds of MB if the repository grows. Several test suites call this function, slowing the test suite and filling tmp on resource-constrained CI runners.

**Recommendation:** For tests that only need validation of a specific subset (e.g., `validate-repository`), copy only the required subdirectories rather than the entire tree.

---

## 4. CI / CD

### 🔴 `publish.yml` calls `node validate.js` (wrong path)

**Location:** `.github/workflows/publish.yml:28`

```yaml
- name: Validate pack contracts
  run: node validate.js
```

The validation script is at `bin/validate.js`, not the root. `node validate.js` will fail with `MODULE_NOT_FOUND` on every tag-push publish attempt. Meanwhile `ci.yml` correctly uses `node bin/validate.js`.

**Recommendation:** Change the publish workflow to `node bin/validate.js` to match CI.

---

### 🟠 Dual release mechanism can double-publish

**Location:** `.github/workflows/publish.yml`, `.github/workflows/release.yml`

Two independent release paths exist:
1. `release.yml` — triggers on every push to `main`, uses `changesets/action` to create a "Version Packages" PR or publish when that PR is merged.
2. `publish.yml` — triggers on any `v*` tag push, runs tests + publish directly.

If a maintainer pushes a tag while the changesets release PR is pending, or if changesets publishes and then the maintainer also pushes a tag, the package can be published twice or with a version conflict.

**Recommendation:** Choose one release strategy. The changesets workflow is more modern and supports staged release PRs; remove `publish.yml` and rely solely on `release.yml`. If a tag-based safety net is desired, add a guard to `publish.yml` that checks for an existing npm version before publishing (`npm view $PKG_NAME@$VERSION version 2>/dev/null && exit 0`).

---

### 🟡 Node.js 22 absent from CI matrix

**Location:** `.github/workflows/ci.yml:matrix.node-version`

Matrix tests Node 18 and 20. Node 22 is the current LTS as of 2025-04-22 and is widely deployed. Users running Node 22 may encounter subtle API changes (e.g., `fs` behavior, `node:test` API changes) not caught by CI.

**Recommendation:** Add `22` to the node-version matrix.

---

### 🟡 `always-auth` npm config produces warnings on every npm command

**Location:** Persistent npm config on this machine (not a repo file)

Every `npm` invocation emits:
```
npm warn Unknown user config "always-auth". This will stop working in the next major version of npm.
```

This pollutes CI logs and may eventually become a hard error. While this is a local machine config (not a repo-level issue), if it exists in the CI environment it will appear in every workflow step.

**Recommendation:** Remove `always-auth` from the npm user config (`~/.npmrc`). If it's needed for a private registry, use `_authToken` instead per npm docs.

---

## 5. Security

### 🟠 Telemetry storage has no file-size cap

**Location:** `lib/insights/telemetry-server.ts:writeTelemetryExport()`

```typescript
fs.appendFileSync(storagePath, line, "utf8");
```

There is no check on the total size of `harness-telemetry.ndjson` before appending. In a long-running server, repeated POSTs could fill the disk. The per-request body limit (`maxBodyBytes`, default 1 MB) limits individual payload size, but not cumulative storage.

**Recommendation:** Before appending, stat the file and reject the write (or rotate to a new file) if it exceeds a configurable limit (e.g., 50 MB). Log a warning when the limit is approached.

---

### 🟠 `shell: true` in eval check runner

**Location:** `lib/evals/checks.ts:runCommand()`

```typescript
childProcess.spawnSync(command, {
  shell: true,
  ...
});
```

The `command` string comes from `check.command` in eval task JSON files. If users can supply their own eval registry JSON (e.g., via a malicious pack), arbitrary shell commands execute. Even for the bundled evals, `shell: true` is unnecessary for simple `npm test`-style commands.

**Recommendation:** Parse commands into `[executable, ...args]` and use `spawnSync(executable, args, { shell: false })`. For commands that genuinely need shell features, document them explicitly and restrict to the packRoot-controlled registry.

---

### 🟡 No npm publish provenance

**Location:** `.github/workflows/publish.yml`

The workflow has `id-token: write` permission (needed for OIDC) but does not pass `--provenance` to `npm publish`. npm provenance (available since npm 9) attests the build provenance and links the published artifact to a verifiable GitHub Actions run, which is a supply chain best practice.

**Recommendation:** Replace `run: npm publish` with `run: npm publish --provenance`.

---

### 🟡 `providers/schema.json` is not validated at runtime

**Location:** `lib/provider-registry.ts:loadProviderManifests()`

Provider JSON manifests are parsed with `JSON.parse(...) as ProviderManifest` — a type assertion without runtime shape validation. A malformed or tampered provider manifest (e.g., missing `id`, wrong shape) will not throw until a property access fails, producing a cryptic error.

**Recommendation:** Validate each manifest against `providers/schema.json` using the bundled JSON schema at load time, or at minimum add a guard on the required fields (`id`, `label`, `nativeSlashCommands`, `ruleEntrypoints`, `installPaths`).

---

## 6. Developer Experience

### 🟠 `npm test` fails with `tsc: command not found` when devDeps not compiled

**Observed behavior:** Running `npm test` produces:
```
> ai-engineering-harness@1.0.1 build
> tsc -p tsconfig.build.json
sh: tsc: command not found
```

`typescript` is listed as a devDependency but `tsc` is invoked as a bare shell command. On some environments (notably when installed via pnpm or in strict PATH configurations), `tsc` is not in PATH even when `node_modules/.bin/tsc` exists.

**Recommendation:** Change the `build` script from `tsc -p tsconfig.build.json` to `node_modules/.bin/tsc -p tsconfig.build.json` (or use `npx --no-install tsc`). This ensures the locally installed TypeScript is always used regardless of PATH.

---

### 🟡 No `build:watch` script

**Location:** `package.json:scripts`

Development requires `npm run build` before every test run. There is no watch mode for incremental compilation, making the inner loop slow during active development.

**Recommendation:** Add `"build:watch": "tsc -p tsconfig.build.json --watch"` to `package.json`.

---

### 🟡 `--ref` flag appears in CLI but does nothing

**Location:** `lib/cli-args.ts`, README quickstart

The `--ref` flag is parsed and stored (`options.ref`) but never passed to any install or update function. Users who read the source or help text and try `npx ai-engineering-harness install --ref my-branch` will see it silently ignored.

**Recommendation:** Either implement it (useful for pinning a specific harness version in CI) or remove it from the CLI and help text.

---

### 🟡 `lib/install-legacy.ts` ships with `dist/` despite pending removal

**Location:** `lib/install-legacy.ts`, `package.json:files`

The file is marked deprecated (v1.1.0 removal), but it's still compiled, shipped in npm, and accessible as a public import path. Users who discover `install-legacy.ts` via autocomplete or package inspection will be confused by the deprecation docs.

**Recommendation:** Add a `@deprecated` JSDoc tag to `installHarness()` so IDEs surface the warning at call sites, and add a link to the migration path (`aih install`).

---

### 🟡 Harness skeleton files end with `\n` but comment says shell strips it

**Location:** `lib/backend/harness-skeleton.ts:writeTargetFile()` docstring

The comment reads: *"A byte-for-byte diff against shell-generated output will therefore show a 1-byte difference; this is intentional and an improvement."* This is correct, but it means existing installations created by the shell script may appear modified (`SKIP` vs `OVERWRITE`) on their first TypeScript-backed install unless `force` is explicitly set. New users are unaffected.

**Recommendation:** Document this behavior difference in the migration/update notes so users upgrading from `aih.sh`-installed harnesses understand why skeleton files are offered as overwrites.

---

## 7. Documentation

### 🟡 `aih.sh` still shipped with no deprecation status declared

**Location:** `package.json:files`, `aih.sh`

The shell script is listed as a first-class package artifact alongside the TypeScript CLI. There is no README note, CHANGELOG entry, or comment in `aih.sh` explaining whether it is the primary entry point, a fallback, or in the process of being superseded. Users choosing between `npx ai-engineering-harness` and `./aih.sh` have no guidance.

**Recommendation:** Add a top-of-file comment to `aih.sh` and a note in the README clearly stating: the TypeScript CLI (`npx ai-engineering-harness`) is the primary surface; `aih.sh` is a legacy fallback maintained for environments where Node.js is not available.

---

### 🟡 `index.d.ts` declares types but ships more than the public API

**Location:** `index.d.ts`

The declaration file is manually maintained and includes every internal module type. As the codebase grows this diverges from the actual compiled output. The package does not use `"exports"` in `package.json`, so any path under `dist/` is technically public.

**Recommendation:** Add an `"exports"` field to `package.json` to explicitly declare the public API surface (e.g., only `"."` for the main CLI entry). This prevents accidental deep imports into internal modules and makes future breaking changes less risky.

---

### 🟡 Provider detection in `detectInstalledProviders` vs `detectRuntimesFromTarget` is duplicated

**Location:** `lib/cli-detect.ts:detectInstalledProviders()`, `lib/backend/status-doctor.ts:detectRuntimesFromTarget()`

Both functions detect installed providers by checking well-known file paths. They are maintained separately and have subtle differences (e.g., `cli-detect.ts` checks `.codex-plugin/plugin.json` while `status-doctor.ts` checks `.gemini/extensions/ai-engineering-harness/GEMINI.md`). A provider added to one may be missed by the other.

**Recommendation:** Consolidate into a single `detectInstalledProviders()` function in a shared module (e.g., `lib/backend/detect.ts`) and import it from both call sites.

---

## 8. Gaps Summary Table

| # | Severity | Area | Finding | Recommended Action |
|---|---|---|---|---|
| 1 | 🔴 | Architecture | `update`/`uninstall` still shell out | Wire to in-process backends |
| 2 | 🔴 | Architecture | Policy engine never invoked | Wire into harness-run / harness-ship |
| 3 | 🟠 | Architecture | `scope-guard` fires on `**` | Narrow default pattern |
| 4 | 🟠 | Code Quality | Systemic `@ts-ignore` (30+) | Convert JS files to TS |
| 5 | 🟠 | Code Quality | Dynamic `require()` in TS module bodies | Convert to static imports |
| 6 | 🟠 | Testing | No tests for policy engine | Add `test/policy-engine.test.js` |
| 7 | 🟠 | Testing | `callLlmJudge` no timeout | Add `AbortSignal` with 30s timeout |
| 8 | 🔴 | CI/CD | `publish.yml` calls `node validate.js` (wrong path) | Change to `node bin/validate.js` |
| 9 | 🟠 | CI/CD | Dual release mechanism | Remove `publish.yml`, keep changesets |
| 10 | 🟠 | Security | Telemetry storage unbounded file growth | Add size limit / rotation |
| 11 | 🟠 | Security | `shell: true` in eval check runner | Parse commands, use `shell: false` |
| 12 | 🟡 | Architecture | PROVIDER_IDS duplicated in 3 places | Single source of truth |
| 13 | 🟡 | Architecture | Dead `parseArgs()` in `install-runtime.ts` | Remove dead code |
| 14 | 🟡 | Architecture | `RUNTIME_CATALOG_REFACTORING.md` in `lib/` | Move to `docs/internal/` |
| 15 | 🟡 | Code Quality | `ref` parsed but never used | Implement or remove |
| 16 | 🟡 | Code Quality | `bannerVerb` mixes UI into data context | Extract banner to caller |
| 17 | 🟡 | Code Quality | `install-legacy` deprecation not runtime-visible | Add `process.stderr` warning |
| 18 | 🟡 | Code Quality | `RegExp` from policy JSON without validation | Validate at load time |
| 19 | 🟡 | Testing | 65% coverage threshold is low | Raise to 75% / multi-platform |
| 20 | 🟡 | Testing | CI eval step may call LLM API | Add `--no-llm-judge` to CI invocation |
| 21 | 🟡 | Testing | `makeTempRepoCopy` copies full tree | Copy only required subdirectories |
| 22 | 🟡 | CI/CD | Node.js 22 absent from matrix | Add to version matrix |
| 23 | 🟡 | Security | No npm publish provenance | Add `--provenance` flag |
| 24 | 🟡 | Security | Provider manifests not runtime-validated | Validate shape at `loadProviderManifests()` |
| 25 | 🟠 | DX | `npm test` fails: `tsc: command not found` | Use `node_modules/.bin/tsc` in build script |
| 26 | 🟡 | DX | No `build:watch` script | Add `"build:watch"` to `package.json` |
| 27 | 🟡 | Documentation | `aih.sh` deprecation status undeclared | Add clear deprecation notice |
| 28 | 🟡 | Documentation | No `"exports"` field in `package.json` | Add explicit public API surface |
| 29 | 🟡 | Documentation | `detectInstalledProviders` duplicated | Consolidate into shared module |

---

## 9. Prioritized Action Plan

### Milestone 1 — Correctness (v1.0.2)
1. Fix `publish.yml` wrong path → `node bin/validate.js` (5 min, prevents broken releases)
2. Wire `update` command to `lib/backend/update.ts` (already implemented, just needs plumbing)
3. Add `--no-llm-judge` to CI eval invocation

### Milestone 2 — Platform Completeness (v1.1.0)
4. Implement `lib/backend/uninstall.ts` and wire CLI
5. Wire policy engine into `harness-run` / `harness-ship` commands
6. Fix `npm test` → `node_modules/.bin/tsc` in build script
7. Remove dual release workflows; keep changesets only
8. Consolidate `detectInstalledProviders` duplication
9. Convert top 5 JS files to TypeScript to eliminate `@ts-ignore` clusters

### Milestone 3 — Quality Gate (v1.1.x)
10. Add `test/policy-engine.test.js`
11. Raise coverage threshold to 75%
12. Add `callLlmJudge` timeout
13. Narrow `scope-guard` default policy
14. Add telemetry storage size limit

---

*End of review. All file:line references are to the state of `main` as of commit `6029407`.*
