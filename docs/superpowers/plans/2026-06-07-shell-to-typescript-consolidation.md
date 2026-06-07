# Shell → TypeScript Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all shell scripts and run the entire `aih` CLI backend in-process with TypeScript, then fix every P0–P3 issue from the project review.

**Architecture:** The TS wizard layer (`lib/cli-commands/*.ts`) already handles prompts/plan/confirm and currently shells out to `aih.sh --yes` only for backend work. We move that backend work into focused TS modules under `lib/backend/` called in-process, delete the shell layer, and bundle the review fixes. The existing `test/run-tests.js` (spawns `bin/aih.js` against temp git repos) is the behavioral parity net — ported behavior is "correct" when those tests stay green.

**Tech Stack:** Node ≥18, TypeScript 6, `node:test`, `c8` coverage, `@clack/prompts`, ESLint + (new) `@typescript-eslint`.

**Source spec:** [2026-06-07-shell-to-typescript-consolidation-design.md](../specs/2026-06-07-shell-to-typescript-consolidation-design.md)

---

## File Structure

**New (Phase A):**
- `lib/backend/constants.ts` — shared constants (exclude-block markers, ignore paths per provider, uninstall paths).
- `lib/backend/git-hygiene.ts` — `.git/info/exclude` block management + private ignore.
- `lib/backend/harness-skeleton.ts` — `.harness/` skeleton init.
- `lib/backend/install-orchestrator.ts` — in-process install (calls `installRuntime`, install-legacy, `installCapabilityCache` as functions).
- `lib/backend/uninstall.ts` — path resolution, harness-owned marker, file/dir removal.
- `lib/backend/update.ts` — update flow.
- `lib/backend/status-doctor.ts` — status + doctor reporting.
- `test/backend/*.test.js` — unit tests per backend module.

**Modified (Phase A):**
- `lib/cli-backend.ts` — delete `findSh`/`runAihSh`/`SH_MISSING_MSG`; `build*Args` → context builders returning objects.
- `lib/cli-commands/{install,update,uninstall,diagnostics}.ts` — call backend functions instead of `runAihSh`.
- `package.json` `files[]` (remove shell entries), `bin` unchanged.
- `README.md`, `docs/install-*.md`, `docs/consume-as-pack.md`, `docs/consumption-modes.md`.
- `test/cli-command-wizards.test.js`, `test/run-tests.js` (rewrite aih.sh references).

**Deleted (Phase A):** `aih.sh`, `aih.sh.sha256`, `aih.ps1`, `install.sh`, `install-secure.sh`.

**Modified (Phase B):** `.github/workflows/ci.yml`, `.eslintrc.json`, `package.json` (lint script), `lib/evals/reporter.ts`, `docs/evals.md`, `hooks/core/guard-phase.js`, `hooks/providers/claude/settings.example.json`, `docs/internal/archive/**`.

---

## PHASE A — Migration (sequential, one foundational worker)

> Run Phase A tasks in order. Do NOT parallelize — they share `cli-backend.ts`, `cli-commands/*`, `package.json`.

### Task A0: Capture parity baseline

**Files:**
- Create: `docs/superpowers/plans/parity-baseline-A0.md` (scratch, gitignored or committed as evidence)

- [ ] **Step 1: Build current code**

Run: `npm run build`
Expected: exit 0, `dist/` populated.

- [ ] **Step 2: Run the behavioral parity suite and save output**

Run: `node --test test/run-tests.js 2>&1 | tee /tmp/parity-before.txt`
Expected: all pass. This file is the reference for "behavior unchanged".

- [ ] **Step 3: Snapshot a real install's side effects on a temp repo**

```bash
T=$(mktemp -d); git -C "$T" init -q
node bin/aih.js install --provider claude --yes --target "$T"
node bin/aih.js install --provider cursor --yes --target "$T"
{ echo "=== tree ==="; cd "$T" && find . -not -path './.git/*' | sort;
  echo "=== exclude ==="; cat "$T/.git/info/exclude"; } > /tmp/parity-install-before.txt
node bin/aih.js status --target "$T" > /tmp/parity-status-before.txt 2>&1
node bin/aih.js doctor --target "$T" > /tmp/parity-doctor-before.txt 2>&1
node bin/aih.js uninstall --provider claude --yes --target "$T" > /tmp/parity-uninstall-before.txt 2>&1
```
Expected: files created under `.cursor/`, `.claude/`, `.ai-harness/`; `.git/info/exclude` contains a block delimited by `# ai-engineering-harness start` / `# ai-engineering-harness end`. Keep `/tmp/parity-*-before.txt` for diffing after migration.

- [ ] **Step 4: Commit baseline note**

```bash
git add docs/superpowers/plans/parity-baseline-A0.md
git commit -m "test: capture pre-migration parity baseline reference"
```

---

### Task A1: Backend constants + git-hygiene module

Port `aih.sh:204-665` (`git_info_exclude_path`, `has_harness_exclude_block`, `harness_ignore_paths_for_runtime`, `collect_ignore_paths`, `build_exclude_block_content`, `append_or_update_info_exclude_block`, `remove_info_exclude_block`, `print_manual_ignore_instructions`, `apply_private_ignore`).

**Files:**
- Create: `lib/backend/constants.ts`
- Create: `lib/backend/git-hygiene.ts`
- Test: `test/backend/git-hygiene.test.js`

- [ ] **Step 1: Write `lib/backend/constants.ts`**

```typescript
export const EXCLUDE_BLOCK_START = "# ai-engineering-harness start";
export const EXCLUDE_BLOCK_END = "# ai-engineering-harness end";
export const HARNESS_MARKER = "ai-engineering-harness";

/** Provider command surface paths (relative to target). */
export function providerCommandPaths(provider: string): string[] {
  switch (provider) {
    case "cursor":
      return [".cursor/rules/ai-engineering-harness-commands.mdc"];
    case "claude":
      return [".claude/commands/"];
    case "gemini":
      return [".gemini/extensions/ai-engineering-harness/commands/"];
    default:
      return [];
  }
}

/** Paths to ignore for a provider install. Mirrors aih.sh harness_ignore_paths_for_runtime. */
export function ignorePathsForProvider(provider: string, initHarness: boolean): string[] {
  const out: string[] = [];
  if (initHarness) out.push(".harness/");
  switch (provider) {
    case "cursor":
      out.push(".cursor/rules/ai-engineering-harness.mdc", ...providerCommandPaths("cursor"));
      break;
    case "claude":
      out.push(".claude/CLAUDE.md", ".claude/settings.json", ...providerCommandPaths("claude"));
      break;
    case "gemini":
      out.push(".gemini/extensions/ai-engineering-harness/", ...providerCommandPaths("gemini"));
      break;
    case "opencode":
      out.push(".opencode/plugins/ai-engineering-harness.js");
      break;
    case "codex":
    case "generic":
    case "manual":
      out.push("AGENTS.md");
      break;
    case "all":
      out.push(
        ".cursor/rules/ai-engineering-harness.mdc",
        ".cursor/rules/ai-engineering-harness-commands.mdc",
        ".claude/CLAUDE.md",
        ".claude/settings.json",
        ".claude/commands/",
        ".gemini/extensions/ai-engineering-harness/",
        "AGENTS.md"
      );
      break;
  }
  return out;
}

/** Paths removed on uninstall for a provider. Mirrors aih.sh runtime_paths_for_uninstall. */
export function uninstallPathsForProvider(provider: string): string[] {
  // Same mapping as ignorePathsForProvider but without the leading .harness/.
  return ignorePathsForProvider(provider, false);
}
```

> NOTE: confirm `uninstall` mapping against `aih.sh:281-315` while implementing; if it diverges from `ignorePathsForProvider`, give it its own switch. The parity test in Task A4 is authoritative.

- [ ] **Step 2: Write the failing test `test/backend/git-hygiene.test.js`**

```javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  applyPrivateIgnore,
  removeIgnoreBlock,
  collectIgnorePaths,
} = require("../../dist/lib/backend/git-hygiene.js");

function tmpGitRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-"));
  fs.mkdirSync(path.join(dir, ".git", "info"), { recursive: true });
  return dir;
}

test("applyPrivateIgnore writes a delimited harness block into .git/info/exclude", () => {
  const dir = tmpGitRepo();
  applyPrivateIgnore({ targetAbs: dir, provider: "claude", initHarness: true, installCache: true,
    scope: "project", visibility: "private", dryRun: false });
  const content = fs.readFileSync(path.join(dir, ".git", "info", "exclude"), "utf8");
  assert.match(content, /# ai-engineering-harness start/);
  assert.match(content, /# ai-engineering-harness end/);
  assert.match(content, /\.harness\//);
  assert.match(content, /\.claude\/CLAUDE\.md/);
  assert.match(content, /\.ai-harness\//);
});

test("applyPrivateIgnore is idempotent (re-run replaces the block, no duplicates)", () => {
  const dir = tmpGitRepo();
  const opts = { targetAbs: dir, provider: "claude", initHarness: true, installCache: false,
    scope: "project", visibility: "private", dryRun: false };
  applyPrivateIgnore(opts);
  applyPrivateIgnore(opts);
  const content = fs.readFileSync(path.join(dir, ".git", "info", "exclude"), "utf8");
  assert.equal((content.match(/# ai-engineering-harness start/g) || []).length, 1);
});

test("removeIgnoreBlock strips the harness block but keeps other lines", () => {
  const dir = tmpGitRepo();
  const excl = path.join(dir, ".git", "info", "exclude");
  fs.writeFileSync(excl, "node_modules/\n# ai-engineering-harness start\n.harness/\n# ai-engineering-harness end\n");
  removeIgnoreBlock({ targetAbs: dir, dryRun: false });
  const content = fs.readFileSync(excl, "utf8");
  assert.match(content, /node_modules\//);
  assert.doesNotMatch(content, /ai-engineering-harness/);
});

test("dryRun never mutates the exclude file", () => {
  const dir = tmpGitRepo();
  applyPrivateIgnore({ targetAbs: dir, provider: "cursor", initHarness: true, installCache: false,
    scope: "project", visibility: "private", dryRun: true });
  assert.equal(fs.existsSync(path.join(dir, ".git", "info", "exclude")), false);
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `npm run build && node --test test/backend/git-hygiene.test.js`
Expected: FAIL (module not found / functions undefined).

- [ ] **Step 4: Implement `lib/backend/git-hygiene.ts`**

Port the awk-based block replace to a line filter. Interface:

```typescript
import * as fs from "node:fs";
import * as path from "node:path";
import { EXCLUDE_BLOCK_START, EXCLUDE_BLOCK_END, ignorePathsForProvider } from "./constants";

export interface IgnoreContext {
  targetAbs: string;
  provider: string;
  initHarness: boolean;
  installCache: boolean;
  scope: string;
  visibility: string;
  dryRun: boolean;
}

export function collectIgnorePaths(ctx: IgnoreContext): string[] {
  const paths = ignorePathsForProvider(ctx.provider, ctx.initHarness);
  if (ctx.installCache) paths.push(".ai-harness/");
  return [...new Set(paths)]; // dedupe, preserve order (awk '!seen[$0]++')
}
// excludeFilePath(targetAbs), hasHarnessBlock(content), buildBlock(paths),
// applyPrivateIgnore(ctx)  -> returns {action:'update'|'skip'|'manual', paths},
// removeIgnoreBlock({targetAbs,dryRun}) -> {action:'update'|'skip'}
// applyPrivateIgnore must: return early if scope!=='project' || visibility!=='private';
//   print manual instructions to stderr when not a git repo; replace existing block in place;
//   append with a leading blank line when file exists without a block; create file with just the block otherwise.
```

Replicate the in-place replacement (lines between START/END swapped for new block) exactly as `aih.sh:594-607`.

- [ ] **Step 5: Run tests, verify pass**

Run: `node --test test/backend/git-hygiene.test.js`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/backend/constants.ts lib/backend/git-hygiene.ts test/backend/git-hygiene.test.js
git commit -m "feat(backend): port git-hygiene exclude-block logic to TypeScript"
```

---

### Task A2: Harness skeleton module

Port `aih.sh:1513-1816` (`harness_skeleton_*`, `init_harness_profile`).

**Files:**
- Create: `lib/backend/harness-skeleton.ts`
- Test: `test/backend/harness-skeleton.test.js`

- [ ] **Step 1: Write failing test**

```javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { initHarnessProfile } = require("../../dist/lib/backend/harness-skeleton.js");

test("initHarnessProfile creates the .harness skeleton with expected files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hs-"));
  initHarnessProfile({ targetAbs: dir, dryRun: false });
  for (const rel of [".harness/HARNESS.md", ".harness/memory/decisions.md"]) {
    assert.equal(fs.existsSync(path.join(dir, rel)), true, `${rel} should exist`);
  }
});

test("initHarnessProfile dryRun creates nothing", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hs-"));
  initHarnessProfile({ targetAbs: dir, dryRun: true });
  assert.equal(fs.existsSync(path.join(dir, ".harness")), false);
});
```

> While implementing, enumerate the exact file set from `aih.sh:1798-1816` (`init_harness_profile`) and the `write_target_file` helper (`aih.sh:1479`) — match filenames and skeleton content verbatim so existing docs/tests that reference them stay valid.

- [ ] **Step 2: Run test, verify fails.** Run: `npm run build && node --test test/backend/harness-skeleton.test.js` → FAIL.

- [ ] **Step 3: Implement `lib/backend/harness-skeleton.ts`** with `initHarnessProfile({targetAbs,dryRun})` and per-file skeleton string functions matching `aih.sh:1513-1798`.

- [ ] **Step 4: Run test, verify pass.**

- [ ] **Step 5: Commit**

```bash
git add lib/backend/harness-skeleton.ts test/backend/harness-skeleton.test.js
git commit -m "feat(backend): port .harness skeleton init to TypeScript"
```

---

### Task A3: Install orchestrator (in-process)

Replace `run_runtime_native_install`/`run_manual_install`/`run_capability_cache_install` (`aih.sh:786,1868,1888`) which spawn `node dist/lib/install-runtime.js|install-legacy.js|install-cache.js`. Call those modules' **exported functions** directly.

**Files:**
- Create: `lib/backend/install-orchestrator.ts`
- Test: `test/backend/install-orchestrator.test.js`
- Reference exports: `lib/install-runtime.ts:424` (`installRuntime`), `lib/install-cache.ts` (`installRuntimeCommandCatalog` via `install-cache`), `lib/install-legacy.ts`.

- [ ] **Step 1: Confirm callable exports**

Run: `grep -n "^export\|module.exports\|export {" lib/install-runtime.ts lib/install-legacy.ts lib/install-cache.ts`
Expected: `installRuntime`, the legacy `main`/install fn, and the cache install fn are exported. If a needed function isn't exported, add it (no behavior change).

- [ ] **Step 2: Write failing test**

```javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const { runInstall } = require("../../dist/lib/backend/install-orchestrator.js");

test("runInstall provisions a claude provider surface in-process", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "io-"));
  cp.spawnSync("git", ["init", "-q"], { cwd: dir });
  const result = runInstall({
    packRoot: path.resolve(__dirname, "..", ".."),
    targetAbs: dir, provider: "claude", scope: "project", visibility: "private",
    dryRun: false, initHarness: true, installCache: true,
  });
  assert.equal(result.ok, true);
  assert.equal(fs.existsSync(path.join(dir, ".claude", "CLAUDE.md")), true);
});

test("runInstall dryRun creates no provider files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "io-"));
  cp.spawnSync("git", ["init", "-q"], { cwd: dir });
  runInstall({ packRoot: path.resolve(__dirname, "..", ".."), targetAbs: dir,
    provider: "claude", scope: "project", visibility: "private",
    dryRun: true, initHarness: true, installCache: true });
  assert.equal(fs.existsSync(path.join(dir, ".claude")), false);
});
```

- [ ] **Step 3: Run, verify fails.** `npm run build && node --test test/backend/install-orchestrator.test.js` → FAIL.

- [ ] **Step 4: Implement `runInstall(ctx)`** that, in order: optionally `initHarnessProfile`, run runtime-native or manual install via imported fns, run capability cache install when `installCache`, then `applyPrivateIgnore(ctx)`. Return `{ok:boolean, messages:string[]}`. Mirror the call order at `aih.sh:2120-2163`.

- [ ] **Step 5: Run, verify pass.**

- [ ] **Step 6: Commit**

```bash
git add lib/backend/install-orchestrator.ts test/backend/install-orchestrator.test.js
git commit -m "feat(backend): in-process install orchestrator replacing shell spawns"
```

---

### Task A4: Uninstall module

Port `aih.sh:281-748,1173` (`runtime_paths_for_uninstall`, `file_contains_harness_marker`, `remove_file_if_harness_owned`, `remove_dir_if_requested`, `run_uninstall`).

**Files:**
- Create: `lib/backend/uninstall.ts`
- Test: `test/backend/uninstall.test.js`

- [ ] **Step 1: Write failing test**

```javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runUninstall } = require("../../dist/lib/backend/uninstall.js");

test("runUninstall removes harness-owned provider files only", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "un-"));
  fs.mkdirSync(path.join(dir, ".claude"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".claude", "CLAUDE.md"), "ai-engineering-harness\n");
  fs.writeFileSync(path.join(dir, ".claude", "user.md"), "mine\n");
  runUninstall({ targetAbs: dir, provider: "claude", scope: "project", dryRun: false });
  assert.equal(fs.existsSync(path.join(dir, ".claude", "CLAUDE.md")), false);
  assert.equal(fs.existsSync(path.join(dir, ".claude", "user.md")), true);
});

test("runUninstall dryRun removes nothing", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "un-"));
  fs.mkdirSync(path.join(dir, ".claude"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".claude", "CLAUDE.md"), "ai-engineering-harness\n");
  runUninstall({ targetAbs: dir, provider: "claude", scope: "project", dryRun: true });
  assert.equal(fs.existsSync(path.join(dir, ".claude", "CLAUDE.md")), true);
});
```

- [ ] **Step 2: Run, verify fails.** → FAIL.

- [ ] **Step 3: Implement `runUninstall(ctx)`**: resolve `uninstallPathsForProvider`, remove files only when `file_contains_harness_marker`-equivalent passes (or ownership === 'always'), remove dirs when requested; also call `removeIgnoreBlock` from git-hygiene. Honor `dryRun`, `removeCache`, `removeState`, `all`.

- [ ] **Step 4: Run, verify pass.**

- [ ] **Step 5: Commit**

```bash
git add lib/backend/uninstall.ts test/backend/uninstall.test.js
git commit -m "feat(backend): port uninstall file/dir removal to TypeScript"
```

---

### Task A5: Update module

Port `aih.sh:976,1132,1211` (`apply_update_defaults`, `resolve_update_git_hygiene_settings`, `run_update`). Update = reinstall over existing surface; reuse `runInstall`.

**Files:**
- Create: `lib/backend/update.ts`
- Test: `test/backend/update.test.js`

- [ ] **Step 1: Write failing test** asserting `runUpdate` refreshes an existing provider file and returns `{ok:true}`. (Install claude, modify CLAUDE.md, runUpdate, assert content restored.)

- [ ] **Step 2: Run, verify fails.**

- [ ] **Step 3: Implement `runUpdate(ctx)`** delegating to `runInstall` semantics with update defaults.

- [ ] **Step 4: Run, verify pass.**

- [ ] **Step 5: Commit** `git commit -m "feat(backend): port update flow to TypeScript"`.

---

### Task A6: Status + doctor module

Port `aih.sh:341-436,1234-1463` (`print_status`, `run_doctor`, `workflow_phase_line`, `print_workflow_summary`, `doctor_plan_status`, `doctor_verify_*`). These already call `node dist/lib/command-surface-report.js` — call its exported `status`/`doctor` functions directly.

**Files:**
- Create: `lib/backend/status-doctor.ts`
- Test: `test/backend/status-doctor.test.js`

- [ ] **Step 1: Confirm `command-surface-report.ts` exports usable functions** (`grep -n "export" lib/command-surface-report.ts`). Export if needed.

- [ ] **Step 2: Write failing test** asserting `runStatus({targetAbs})` returns a string containing the workflow summary and `runDoctor` returns PASS/FAIL lines including "node available".

- [ ] **Step 3: Run, verify fails.**

- [ ] **Step 4: Implement** `runStatus(ctx)` / `runDoctor(ctx)` returning report text (printed by caller), matching `/tmp/parity-status-before.txt` & `/tmp/parity-doctor-before.txt` from A0.

- [ ] **Step 5: Diff against baseline**

```bash
T=$(mktemp -d); git -C "$T" init -q
node bin/aih.js install --provider claude --yes --target "$T" >/dev/null
node bin/aih.js status --target "$T" | diff - /tmp/parity-status-before.txt || echo "REVIEW DIFF"
```
Expected: no diff (or explainable, intentional diffs only).

- [ ] **Step 6: Commit** `git commit -m "feat(backend): port status/doctor reporting to TypeScript"`.

---

### Task A7: Rewire CLI to in-process backend

**Files:**
- Modify: `lib/cli-backend.ts` (remove `findSh`, `runAihSh`, `SH_MISSING_MSG`; change `buildInstallArgs/buildUpdateArgs/buildUninstallArgs` to return context objects).
- Modify: `lib/cli-commands/install.ts`, `update.ts`, `uninstall.ts`, `diagnostics.ts`.
- Modify: `lib/cli-main.ts` (drop `SH_MISSING`/`AIH_SH_MISSING` error branch).

- [ ] **Step 1: Replace `runAihSh(...)` calls** in each `cli-commands/*` with the matching `lib/backend/*` function call, passing context objects (no CLI arg arrays). Remove the per-provider arg building; loop providers calling `runInstall` directly.

- [ ] **Step 2: Delete dead exports** from `cli-backend.ts`; keep `packRootFromModule`. Remove the `--runtime` internal alias usage.

- [ ] **Step 3: Typecheck**

Run: `npm run build && tsc -p tsconfig.lib.json`
Expected: exit 0.

- [ ] **Step 4: Run full suite + diff installs against baseline**

Run: `npm test` then re-run the A0 install snapshot and `diff /tmp/parity-install-before.txt` against a fresh capture.
Expected: tests green; install side effects identical.

- [ ] **Step 5: Commit** `git commit -m "refactor(cli): call TypeScript backend in-process, drop shell spawn"`.

---

### Task A8: Delete shell, update manifests, docs, tests

**Files:**
- Delete: `aih.sh`, `aih.sh.sha256`, `aih.ps1`, `install.sh`, `install-secure.sh`.
- Modify: `package.json` `files[]`; `README.md`; `docs/install-*.md`; `docs/consume-as-pack.md`; `docs/consumption-modes.md`; `test/cli-command-wizards.test.js`; `test/run-tests.js`; `CHANGELOG.md`.

- [ ] **Step 1: Delete shell files**

```bash
git rm aih.sh aih.sh.sha256 aih.ps1 install.sh install-secure.sh
```

- [ ] **Step 2: Remove shell entries from `package.json` `files[]`** (`aih.sh`, `aih.sh.sha256`, `install.sh`, `install-secure.sh`, `aih.ps1`).

- [ ] **Step 3: Rewrite tests that referenced aih.sh** — `cli-command-wizards.test.js` "forwards status to aih.sh" → assert it calls the in-process `runStatus`/`runDoctor`. Update `run-tests.js` if it spawned `aih.sh` directly (it spawns `bin/aih.js`, so likely only assertion text changes).

- [ ] **Step 4: Update README + docs** — Quickstart/Maintainers/Limitations: remove `curl|sh` and `aih.sh`; state Windows runs natively via Node; remove remote no-npm install from `docs/install-*.md`, `docs/consume-as-pack.md`, `docs/consumption-modes.md`.

- [ ] **Step 5: Add a guard test** `test/no-shell-scripts.test.js`:

```javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const repoRoot = path.resolve(__dirname, "..");
test("no shell scripts remain in the repo root", () => {
  for (const f of ["aih.sh", "aih.ps1", "install.sh", "install-secure.sh", "aih.sh.sha256"]) {
    assert.equal(fs.existsSync(path.join(repoRoot, f)), false, `${f} must be deleted`);
  }
});
```

- [ ] **Step 6: CHANGELOG** — add a breaking-change entry: remote `curl|sh` install removed; use `npx ai-engineering-harness install`.

- [ ] **Step 7: Full suite + typecheck + grep gate**

Run: `npm test && tsc -p tsconfig.lib.json && ! grep -rn "aih\.sh" lib bin test package.json README.md`
Expected: tests green, typecheck clean, grep finds no live references (CHANGELOG history allowed).

- [ ] **Step 8: Commit** `git commit -m "chore: remove all shell scripts; npx/npm is the only install surface (BREAKING)"`.

---

### Task A9: Phase A gate

- [ ] Run `npm test` → all green.
- [ ] Run `tsc -p tsconfig.lib.json` → exit 0.
- [ ] Run `grep -rn "runAihSh\|findSh\|aih.sh" lib bin` → no live references.
- [ ] Confirm `/tmp/parity-*-before.txt` diffs are empty or intentional. **Do not start Phase B until this gate passes.**

---

## PHASE B — Report fixes (parallel, after A9)

> B1–B4 touch disjoint file sets and may run as parallel subagents.

### Task B1: CI fix + lint lib/  (files: `.github/workflows/ci.yml`, `.eslintrc.json`, `package.json`, `package-lock.json`)

- [ ] **Step 1:** In `ci.yml`, change `run: node validate.js` → `run: node bin/validate.js`. Remove `shell: bash` from the smoke-install step (now native Node) and run `node bin/aih.js install --provider generic --yes --target "$TARGET" --dry-run` directly.
- [ ] **Step 2:** `npm i -D @typescript-eslint/parser @typescript-eslint/eslint-plugin`.
- [ ] **Step 3:** Extend `.eslintrc.json` with a TS override (parser + plugin) for `lib/**/*.ts`.
- [ ] **Step 4:** Change `package.json` lint to `eslint bin/ test/ lib/ *.js --ext .js,.ts --max-warnings 0`.
- [ ] **Step 5:** Run `npm run lint`; fix surfaced issues. Run: expected exit 0.
- [ ] **Step 6:** Add `test/ci-scripts-match.test.js` asserting `ci.yml` validate step uses `bin/validate.js` (regex on the workflow file) to prevent regression.
- [ ] **Step 7:** Commit `ci: fix validate entrypoint + lint lib/ TypeScript`.

### Task B2: Eval honesty  (files: `lib/evals/reporter.ts`, `README.md`, `docs/evals.md`, `test/cli-eval.test.js`)

- [ ] **Step 1:** In `lib/evals/reporter.ts`, tag run summaries with `evidenceKind: "synthetic-fixture"` (when provider is `deterministic-local`) vs `"live"` (when an agent/judge endpoint produced output).
- [ ] **Step 2:** Update README "Why this instead of…" + Evals section: call it a *deterministic regression framework*; remove wording implying it proves harness improves real outcomes.
- [ ] **Step 3:** Update `docs/evals.md` to document synthetic vs live and that step-counts come from the mutation registry, not measured agent runs.
- [ ] **Step 4:** Add/adjust a test asserting the report contains `evidenceKind: synthetic-fixture` for the default run.
- [ ] **Step 5:** Commit `docs(eval): describe eval as regression framework; mark synthetic vs live`.

### Task B3: Policy engine wiring  (files: `hooks/core/guard-phase.js`, `hooks/core/guard-phase-policy.js`, `hooks/providers/claude/settings.example.json`, `lib/backend/harness-skeleton.ts`, `.github/workflows/ci.yml`, `test/hooks-events.test.js`)

- [ ] **Step 1:** Merge the policy-engine path from `guard-phase-policy.js` into `guard-phase.js` (try engine when `.harness/policies.json` exists, else legacy). Keep `guard-phase-policy.js` as a thin re-export or delete and update references.
- [ ] **Step 2:** In `harness-skeleton.ts` (Task A2), provision a default `.harness/policies.json` (the 5-rule set from this repo's `.harness/policies.json`).
- [ ] **Step 3:** Verify provider settings example wires `guard-phase.js` (already does) — now it gets engine behavior for free.
- [ ] **Step 4:** Add `generate:policy-docs` to a CI step so `docs/policies.md` stays in sync; add note that `policies.json` is trusted input (ReDoS).
- [ ] **Step 5:** Test: install into temp repo with `--init-harness`, assert `.harness/policies.json` exists and `guard-phase.js` blocks when a rule triggers.
- [ ] **Step 6:** Commit `feat(policy): wire engine into guard-phase + provision default policies.json`.

### Task B4: Doc GC  (files: `docs/internal/archive/**`, `docs/`)

- [ ] **Step 1:** Move scattered `v0.x-readiness.md` / `v0.x-plan.md` / `v0.x-release-notes.md` into a single `docs/internal/archive/v0/` (most already there) and add an index; delete duplicates flagged by `test/docs-sprawl.test.js`.
- [ ] **Step 2:** Remove docs describing the deleted shell/remote install that A8 didn't catch (`grep -rln "aih.sh\|curl .*install.sh" docs`).
- [ ] **Step 3:** Run `npm test` (docs-sprawl + session-start guards) → green.
- [ ] **Step 4:** Commit `docs: consolidate v0 archive and prune stale shell-install docs`.

---

## FINAL — Coverage rebaseline + verification

### Task F1: Coverage gate (P0b)  (files: `package.json`, `README.md`)

- [ ] **Step 1:** Run `npm run test:coverage`. Read the new functions/lines/branches numbers (backend modules + tests should raise them).
- [ ] **Step 2:** If ≥ current thresholds, keep them; else set thresholds to the achieved numbers (floor, not ceiling) so CI is honest. Update the README coverage badge to match.
- [ ] **Step 3:** Commit `test: rebaseline coverage thresholds to honest measured values`.

### Task F2: Final verification (REQUIRED SUB-SKILL: superpowers:verification-before-completion)

- [ ] Run `npm run lint && npm test && npm run test:coverage && tsc -p tsconfig.lib.json`. All must pass.
- [ ] Run `node bin/aih.js install --provider claude --yes --target $(mktemp -d) --dry-run` → succeeds with no shell.
- [ ] Confirm `git grep -n "aih\.sh"` returns only CHANGELOG history.
- [ ] Report results with command output (no success claims without evidence).

---

## Self-Review

**Spec coverage:** §3 deletions → A8; §4.1 backend modules → A1–A6; §4.2 rewire → A7; §5 parity net → A0/A7/A9; §6 P0a→B1, P0b→F1, P1a→B2, P1b→B3, P2a→B1, P2b→B4, P3→A7+B3; §7 strategy → phase split. All covered.

**Placeholder scan:** Ported modules reference exact `aih.sh` line ranges + a concrete parity test as executable spec rather than re-transcribing 2k lines of shell speculatively (intentional for a port). All test code is concrete; all interfaces are named.

**Type consistency:** `IgnoreContext`/install context fields (`targetAbs`, `provider`, `scope`, `visibility`, `dryRun`, `initHarness`, `installCache`) are used consistently across A1, A3, A4, A5. `runInstall`/`runUpdate`/`runUninstall`/`runStatus`/`runDoctor`/`applyPrivateIgnore`/`removeIgnoreBlock`/`initHarnessProfile` names are stable across tasks.
