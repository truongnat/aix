const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

test("package.json files entries exist on disk", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  for (const entry of pkg.files) {
    if (entry.startsWith("!")) {
      continue;
    }
    const normalized = entry.replace(/\/$/, "");
    assert.ok(fs.existsSync(path.join(repoRoot, normalized)), `Missing packaged path: ${entry}`);
  }
});

test("package includes evals and documents eval command surface", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  const docs = fs.readFileSync(path.join(repoRoot, "docs", "evals.md"), "utf8");

  assert.ok(pkg.files.includes("evals/"));
  assert.match(readme, /eval list/);
  assert.match(readme, /Evals/);
  assert.match(docs, /with-harness/);
  assert.match(docs, /without-harness/);
});

test("package exposes an incremental TypeScript typecheck for lib", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const tsconfigPath = path.join(repoRoot, "tsconfig.lib.json");

  assert.equal(typeof pkg.scripts.typecheck, "string");
  assert.match(pkg.scripts.typecheck, /tsc/);
  assert.match(pkg.scripts.typecheck, /tsconfig\.lib\.json/);
  assert.ok(pkg.devDependencies.typescript, "typescript devDependency must be present");
  assert.ok(pkg.devDependencies["@types/node"], "@types/node devDependency must be present");
  assert.ok(fs.existsSync(tsconfigPath), "tsconfig.lib.json must exist");

  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
  assert.equal(tsconfig.compilerOptions.allowJs, true);
  assert.equal(tsconfig.compilerOptions.checkJs, true);
  assert.equal(tsconfig.compilerOptions.noEmit, true);
  assert.ok(
    tsconfig.include.includes("lib/provider-registry.ts"),
    "tsconfig.lib.json must include lib/provider-registry.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/cli-providers.ts"),
    "tsconfig.lib.json must include lib/cli-providers.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/provider-rule-renderer.ts"),
    "tsconfig.lib.json must include lib/provider-rule-renderer.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/catalog/provider-command-metadata.ts"),
    "tsconfig.lib.json must include lib/catalog/provider-command-metadata.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/catalog/command-rendering.ts"),
    "tsconfig.lib.json must include lib/catalog/command-rendering.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/catalog/command-installation.ts"),
    "tsconfig.lib.json must include lib/catalog/command-installation.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/runtime-command-catalog.ts"),
    "tsconfig.lib.json must include lib/runtime-command-catalog.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/worker-claude-adapter.ts"),
    "tsconfig.lib.json must include lib/worker-claude-adapter.ts"
  );
  assert.ok(
    tsconfig.include.includes("workers/registry.ts"),
    "tsconfig.lib.json must include workers/registry.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/install-runtime.ts"),
    "tsconfig.lib.json must include lib/install-runtime.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/file-operations.ts"),
    "tsconfig.lib.json must include lib/file-operations.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/command-surface-report.ts"),
    "tsconfig.lib.json must include lib/command-surface-report.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/plugin-packaging.ts"),
    "tsconfig.lib.json must include lib/plugin-packaging.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/install-cache.ts"),
    "tsconfig.lib.json must include lib/install-cache.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/install-legacy.ts"),
    "tsconfig.lib.json must include lib/install-legacy.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/cli-help.ts"),
    "tsconfig.lib.json must include lib/cli-help.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/cli-detect.ts"),
    "tsconfig.lib.json must include lib/cli-detect.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/cli-plan.ts"),
    "tsconfig.lib.json must include lib/cli-plan.ts"
  );
});
