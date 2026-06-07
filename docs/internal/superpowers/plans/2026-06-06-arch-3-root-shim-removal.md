# ARCH-3 Root Shim Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the root-level compatibility shims and make the supported runtime surface explicit through `bin/aih.js`, a dedicated `bin/validate.js` wrapper, and compiled `dist/lib/**` entrypoints.

**Architecture:** Keep the runtime behavior intact, but stop exporting `install.js`, `install-cache.js`, `install-runtime.js`, and `validate.js` from the repository root. Update package scripts, tests, docs, and internal status trackers so the only supported public entrypoints are the CLI binary, the validate wrapper in `bin/`, and compiled runtime modules. This is a breaking surface cleanup, not a behavior rewrite.

**Tech Stack:** Node.js, TypeScript build output in `dist/`, CommonJS CLI wrapper, `node:test`, markdown docs

---

### Task 1: Redirect package and test entrypoints away from root shims

**Files:**
- Modify: `package.json`
- Add: `bin/validate.js`
- Modify: `test/run-tests.js`
- Modify: `test/package-manifest.test.js`

- [ ] **Step 1: Write the failing test**

```js
test("package.json does not expose removed root shims", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));

  assert.ok(!pkg.files.includes("install.js"));
  assert.ok(!pkg.files.includes("install-cache.js"));
  assert.ok(!pkg.files.includes("install-runtime.js"));
  assert.ok(!pkg.files.includes("validate.js"));
  assert.equal(pkg.scripts["install:harness"], "node bin/aih.js install");
  assert.equal(pkg.scripts.validate, "node bin/validate.js");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test test/package-manifest.test.js
node bin/validate.js
```

Expected: FAIL because `package.json` still lists the removed root shims and `bin/validate.js` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```json
{
  "scripts": {
    "install:harness": "node bin/aih.js install",
    "validate": "node bin/validate.js"
  },
  "files": [
    "bin/",
    "dist/",
    "evals/",
    "...",
    "install-secure.sh"
  ]
}
```

```js
const validateApi = require(path.join(repoRoot, "dist", "lib", "validate", "index.js"));
const installApi = require(path.join(repoRoot, "dist", "lib", "install-legacy.js"));
const installCacheApi = require(path.join(repoRoot, "dist", "lib", "install-cache.js"));
```

```js
#!/usr/bin/env node
const validateApi = require("../dist/lib/validate/index.js");

validateApi.main();
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test test/package-manifest.test.js
node bin/validate.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json bin/validate.js test/run-tests.js test/package-manifest.test.js
git commit -m "refactor: move runtime entrypoints off root shims"
```

### Task 2: Remove the root shim files and update docs that still advertise them

**Files:**
- Delete: `install.js`
- Delete: `install-cache.js`
- Delete: `install-runtime.js`
- Delete: `validate.js`
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Modify: `PACK.md`
- Modify: `docs/adoption-guide.md`
- Modify: `docs/install-output-example.md`
- Modify: `docs/plugin-install-security.md`
- Modify: `docs/runtime-native-install.md`
- Modify: `docs/validation-troubleshooting.md`
- Modify: `docs/pack-verification-checklist.md`
- Modify: `docs/release-checklist.md`
- Modify: `docs/runtimes/claude-code.md`
- Modify: `docs/runtimes/cursor.md`
- Modify: `docs/runtimes/README.md` if it mentions the deleted root files
- Add: `test/root-shim-removal.test.js`

- [ ] **Step 1: Write the failing test**

```js
test("documentation no longer advertises deleted root shim entrypoints", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  const pack = fs.readFileSync(path.join(repoRoot, "PACK.md"), "utf8");

  assert.ok(!/node validate\.js\b/.test(readme));
  assert.ok(!/install\.js\b/.test(pack));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test test/root-shim-removal.test.js
node --test test/package-manifest.test.js
```

Expected: FAIL until docs and package surface stop mentioning deleted root files.

- [ ] **Step 3: Write minimal implementation**

```md
node bin/aih.js --help
node bin/validate.js
```

Update markdown examples so they point to the supported surfaces above, and remove any text that implies `install.js`, `install-cache.js`, `install-runtime.js`, or `validate.js` are supported root entrypoints.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test test/root-shim-removal.test.js
node --test test/package-manifest.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add README.md CONTRIBUTING.md PACK.md docs
git add test/root-shim-removal.test.js
git rm install.js install-cache.js install-runtime.js validate.js
git commit -m "refactor: remove root compatibility shims"
```

### Task 3: Update internal review trackers to reflect ARCH-3 completion

**Files:**
- Modify: `docs/internal/reviews/REMAINING_BACKLOG.md`
- Modify: `docs/internal/reviews/IMPROVEMENTS_STATUS.md`
- Modify: `docs/internal/reviews/IMPROVEMENTS_EVALUATION_VI.md`

- [ ] **Step 1: Write the failing test**

```md
| ARCH-3 | **Remove root shims** (`install.js`, `validate.js`, …) | completed |
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rg -n 'ARCH-3|root shims|install\\.js|validate\\.js' docs/internal/reviews
```

Expected: still shows ARCH-3 as open before the edit.

- [ ] **Step 3: Write minimal implementation**

```md
- `ARCH-3` completed: root compatibility shims removed; supported surface is `bin/aih.js` plus compiled `dist/lib/**` entrypoints
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rg -n 'ARCH-3|root shims|install\\.js|validate\\.js' docs/internal/reviews
```

Expected: ARCH-3 is recorded as completed or removed from the open backlog, and the scorecard reflects the new surface.

- [ ] **Step 5: Commit**

```bash
git add docs/internal/reviews/REMAINING_BACKLOG.md docs/internal/reviews/IMPROVEMENTS_STATUS.md docs/internal/reviews/IMPROVEMENTS_EVALUATION_VI.md
git commit -m "docs: mark arch-3 root shim removal complete"
```

### Task 4: Verify the cleaned package surface end to end

**Files:**
- Changed files from Tasks 1-3

- [ ] **Step 1: Run the full verification set**

Run:

```bash
npm run build
npm test
npm run validate
npm pack --dry-run
node bin/aih.js --help
node bin/validate.js
```

Expected: all commands pass, and `npm pack --dry-run` shows no deleted root shim files in the tarball.

- [ ] **Step 2: Check the final surface**

Run:

```bash
git status --short
```

Expected: only the intended ARCH-3 changes remain, with no accidental edits outside the root-shim cleanup scope.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: finalize root shim removal"
```
