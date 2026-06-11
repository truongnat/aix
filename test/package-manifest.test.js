const { test } = require("node:test");
const assert = require("node:assert/strict");
const cp = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
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

test("package.json does not expose removed root shims", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));

  for (const entry of ["aih.sh", "aih.sh.sha256", "install.sh", "install-secure.sh", "aih.ps1"]) {
    assert.ok(!pkg.files.includes(entry), `${entry} should not be packaged`);
    assert.ok(!fs.existsSync(path.join(repoRoot, entry)), `${entry} should be removed`);
  }
  assert.equal(pkg.scripts["install:harness"], "node bin/aih.js install");
  assert.equal(pkg.scripts.validate, "node bin/validate.js");
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

test("Codex plugin manifest exposes skills, commands, agents, and hooks", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(repoRoot, ".codex-plugin", "plugin.json"), "utf8")
  );

  assert.equal(manifest.skills, "./skills/");
  assert.equal(manifest.commands, "./commands/");
  assert.equal(manifest.agents, "./agents/");
  assert.equal(manifest.hooks, "./hooks.json");
  assert.match(manifest.interface.longDescription, /Codex \/plugins/);
});

test("build:codex-plugin stages a publishable Codex bundle", () => {
  const bundleRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-codex-plugin-"));

  try {
    const result = cp.spawnSync(
      process.execPath,
      ["scripts/build-codex-plugin.js", "--out-dir", bundleRoot],
      {
        cwd: repoRoot,
        encoding: "utf8",
      }
    );

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr.trim(), "");
    assert.match(result.stdout, /aih-codex-plugin/);
    assert.ok(fs.existsSync(path.join(bundleRoot, ".codex-plugin", "plugin.json")));
    assert.ok(fs.existsSync(path.join(bundleRoot, "skills")));
    assert.ok(fs.existsSync(path.join(bundleRoot, "commands")));
    assert.ok(fs.existsSync(path.join(bundleRoot, "agents")));
    assert.ok(fs.existsSync(path.join(bundleRoot, "hooks")));
    assert.ok(fs.existsSync(path.join(bundleRoot, "hooks.json")));

    const manifest = JSON.parse(
      fs.readFileSync(path.join(bundleRoot, ".codex-plugin", "plugin.json"), "utf8")
    );
    assert.equal(
      manifest.version,
      JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")).version
    );
  } finally {
    fs.rmSync(bundleRoot, { recursive: true, force: true });
  }
});

test("package exposes an incremental TypeScript typecheck for lib", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const tsconfigPath = path.join(repoRoot, "tsconfig.lib.json");

  assert.equal(typeof pkg.scripts.typecheck, "string");
  assert.equal(
    pkg.scripts.typecheck,
    "node ./node_modules/typescript/bin/tsc -p tsconfig.lib.json"
  );
  assert.match(pkg.scripts.typecheck, /tsconfig\.lib\.json/);
  assert.ok(pkg.devDependencies.typescript, "typescript devDependency must be present");
  assert.ok(pkg.devDependencies["@types/node"], "@types/node devDependency must be present");
  assert.ok(fs.existsSync(tsconfigPath), "tsconfig.lib.json must exist");
  assert.ok(
    fs.existsSync(path.join(repoRoot, "node_modules", "typescript", "bin", "tsc")),
    "local TypeScript CLI must exist"
  );

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
    tsconfig.include.includes("lib/cli-help.ts"),
    "tsconfig.lib.json must include lib/cli-help.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/cli-detect.ts"),
    "tsconfig.lib.json must include lib/cli-detect.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/provider-detection.ts"),
    "tsconfig.lib.json must include lib/provider-detection.ts"
  );
  assert.ok(
    tsconfig.include.includes("lib/cli-plan.ts"),
    "tsconfig.lib.json must include lib/cli-plan.ts"
  );
});

test("package exposes a TypeScript watch build script", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const verifyDistScript = path.join(repoRoot, "scripts", "verify-dist.js");

  assert.equal(pkg.scripts.build, "npm run build:src && npm run build:legacy");
  assert.equal(
    pkg.scripts["build:src"],
    "node ./node_modules/typescript/bin/tsc -p tsconfig.src.json"
  );
  assert.equal(
    pkg.scripts["build:legacy"],
    "node ./node_modules/typescript/bin/tsc -p tsconfig.build.json"
  );
  assert.equal(
    pkg.scripts["build:watch"],
    "node ./node_modules/typescript/bin/tsc -p tsconfig.src.json --watch"
  );
  assert.equal(pkg.scripts["telemetry:server"], "node dist/server/telemetry.js");
  assert.match(pkg.scripts["test:coverage"], /--lines 75/);
  assert.match(pkg.scripts["test:coverage"], /--functions 70/);
  assert.match(pkg.scripts["test:coverage"], /--branches 65/);
  assert.match(pkg.scripts["test:coverage"], /--statements 75/);
  assert.match(pkg.scripts.test, /node scripts\/verify-dist\.js/);
  assert.match(pkg.scripts["test:evals"], /node scripts\/verify-dist\.js/);
  assert.match(pkg.scripts["test:coverage"], /node scripts\/verify-dist\.js/);
  assert.ok(fs.existsSync(verifyDistScript), "scripts/verify-dist.js must exist");
});

test("verify-dist script checks compiled test entrypoints with a clear error message", () => {
  const verifyDist = fs.readFileSync(path.join(repoRoot, "scripts", "verify-dist.js"), "utf8");

  assert.match(verifyDist, /Compiled dist\/ output is incomplete\./);
  assert.match(
    verifyDist,
    /Run `npm run build` and fix the TypeScript\/build error before running tests\./
  );
  assert.match(verifyDist, /dist\/server\/telemetry\.js/);
  assert.match(verifyDist, /dist\/features\/telemetry\/index\.js/);
  assert.match(verifyDist, /dist\/lib\/cli-main\.js/);
  assert.match(verifyDist, /dist\/lib\/evals\/index\.js/);
  assert.match(verifyDist, /dist\/lib\/validate\/index\.js/);
  assert.match(verifyDist, /dist\/workers\/registry\.js/);
});

test("package declares an explicit public exports surface", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const docs = fs.readFileSync(path.join(repoRoot, "docs", "typescript-usage.md"), "utf8");
  const types = fs.readFileSync(path.join(repoRoot, "index.d.ts"), "utf8");

  assert.deepEqual(pkg.exports["."], { types: "./index.d.ts" });
  assert.equal(pkg.exports["./cli-main"], "./dist/lib/cli-main.js");
  assert.equal(pkg.exports["./file-operations"], "./dist/lib/file-operations.js");
  assert.equal(pkg.exports["./validate"], "./dist/lib/validate/index.js");
  assert.equal(pkg.exports["./package.json"], "./package.json");
  assert.match(types, /declare module "ai-engineering-harness"/);
  assert.match(types, /declare module "ai-engineering-harness\/cli-main"/);
  assert.match(types, /declare module "ai-engineering-harness\/file-operations"/);
  assert.match(types, /declare module "ai-engineering-harness\/validate"/);
  assert.doesNotMatch(types, /^export function main/m);
  assert.match(docs, /ai-engineering-harness\/cli-main/);
  assert.match(docs, /ai-engineering-harness\/file-operations/);
  assert.match(docs, /ai-engineering-harness\/validate/);
  assert.match(docs, /package root exports shared types only/i);
  assert.match(docs, /validateHarnessRepository/);
  assert.match(docs, /validateTargetProfile/);
  assert.doesNotMatch(
    docs,
    /const validate = require\('ai-engineering-harness\/validate'\);[\s\S]*validate\(\);/
  );
  assert.doesNotMatch(docs, /ai-engineering-harness\/lib\//);
});

test("npm publish docs describe the compiled tarball surface, not source lib/", () => {
  const publishDoc = fs.readFileSync(path.join(repoRoot, "docs", "npm-publish.md"), "utf8");

  assert.match(publishDoc, /`bin\/`, `dist\/`, `runtime\/`, capability dirs, `docs\/`/);
  assert.doesNotMatch(publishDoc, /`bin\/`, `lib\/`, `runtime\/`, capability dirs, `docs\/`/);
});

test("README declares the Node CLI as the only install surface", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");

  assert.match(
    readme,
    /Node\.js CLI \(`npx ai-engineering-harness \.\.\.`\) is the only supported install and lifecycle surface/
  );
  assert.match(readme, /the only supported install and lifecycle surface/i);
  assert.doesNotMatch(readme, /aih\.sh/);
});

test("README advertises the current coverage target", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");

  assert.match(readme, /coverage-lib%2075%25%2B/);
});

test("cli-ui uses typed imports without ts-ignore suppressions", () => {
  const cliUi = fs.readFileSync(path.join(repoRoot, "lib", "cli-ui.ts"), "utf8");

  assert.match(cliUi, /import type \* as ClackPrompts from "@clack\/prompts"/);
  assert.match(cliUi, /type DynamicImport = <T>\(specifier: string\) => Promise<T>/);
  assert.match(cliUi, /new Function\("specifier", "return import\(specifier\);"\)/);
  assert.match(cliUi, /clackModulePromise = dynamicImport<ClackModule>\("@clack\/prompts"\)/);
  assert.match(cliUi, /async function loadClackPrompts/);
  assert.match(
    cliUi,
    /import \{ formatCommandSupportForPlan \} from "\.\/runtime-command-catalog"/
  );
  assert.doesNotMatch(cliUi, /@ts-ignore/);
});

test("update docs explain the shell-era .harness trailing-newline migration diff", () => {
  const usage = fs.readFileSync(path.join(repoRoot, "docs", "update-usage.md"), "utf8");
  assert.match(usage, /\.harness\/\*\.md/);
  assert.match(usage, /TypeScript-backed install or[\s\S]*re-init/);
  assert.match(usage, /trailing newline|required by normal POSIX text files/);
  assert.match(usage, /No shell installer path remains in the current surface\./);
});

test("CLI UX docs describe the primary lifecycle path as in-process, not shell-backed", () => {
  const npxUx = fs.readFileSync(path.join(repoRoot, "docs", "npx-cli-ux.md"), "utf8");
  const wizardUx = fs.readFileSync(path.join(repoRoot, "docs", "terminal-wizard-ux.md"), "utf8");
  const versioning = fs.readFileSync(path.join(repoRoot, "docs", "versioning.md"), "utf8");

  assert.match(npxUx, /Spinner \+ in-process backend run per provider/);
  assert.match(npxUx, /is the \*\*primary\*\* install UX for v0\.11\.x/i);

  assert.match(wizardUx, /In-process lifecycle execution/);

  assert.match(versioning, /later releases moved the primary lifecycle commands in-process/);
  assert.doesNotMatch(versioning, /until a native JS backend exists/);
});

test("cli-backend only retains pack-root resolution after the in-process port", () => {
  const backend = fs.readFileSync(path.join(repoRoot, "lib", "cli-backend.ts"), "utf8");

  assert.match(backend, /function packRootFromModule/);
  assert.match(backend, /export \{ packRootFromModule \}/);
  assert.doesNotMatch(backend, /runAihSh|findSh|SH_MISSING_MSG/);
  assert.doesNotMatch(backend, /buildInstallArgs|buildUpdateArgs|buildUninstallArgs/);
});

test("lib/ and workers/ source tree stays free of @ts-ignore suppressions", () => {
  const roots = [path.join(repoRoot, "lib"), path.join(repoRoot, "workers")];
  const matches = [];
  const pending = [...roots];

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(fullPath);
        continue;
      }
      if (!entry.isFile() || !/\.(ts|js|md)$/.test(entry.name)) {
        continue;
      }
      const text = fs.readFileSync(fullPath, "utf8");
      if (text.includes("@ts-ignore")) {
        matches.push(path.relative(repoRoot, fullPath));
      }
    }
  }

  assert.deepEqual(matches, [], `Unexpected @ts-ignore suppression(s):\n${matches.join("\n")}`);
});

test("CI smoke install uses a runner-agnostic Node invocation instead of bash", () => {
  const workflow = fs.readFileSync(path.join(repoRoot, ".github", "workflows", "ci.yml"), "utf8");
  const smokeInstall = fs.readFileSync(path.join(repoRoot, "scripts", "smoke-install.js"), "utf8");

  assert.match(workflow, /name: Smoke test install \(dry-run\)/);
  assert.match(workflow, /run: node scripts\/smoke-install\.js/);
  assert.match(smokeInstall, /process\.env\.RUNNER_TEMP \|\| os\.tmpdir\(\)/);
  assert.match(smokeInstall, /spawnSync\(\s*process\.execPath,/);
  assert.match(smokeInstall, /"bin\/aih\.js", "install"/);
  assert.match(smokeInstall, /"--provider", "cursor"/);
  assert.match(smokeInstall, /"--dry-run"/);
});

test("active adoption docs use Session Start as the primary loop and keep Map as compatibility", () => {
  const adoptionGuide = fs.readFileSync(path.join(repoRoot, "docs", "adoption-guide.md"), "utf8");
  const commandLoop = fs.readFileSync(path.join(repoRoot, "docs", "command-loop.md"), "utf8");
  const hostChecklist = fs.readFileSync(
    path.join(repoRoot, "docs", "host-repo-checklist.md"),
    "utf8"
  );

  assert.match(adoptionGuide, /1\. `Start`/);
  assert.match(adoptionGuide, /7\. `Remember`/);
  assert.match(adoptionGuide, /compatibility or manual context-refresh command/i);
  assert.doesNotMatch(adoptionGuide, /1\. `Map`[\s\S]*2\. `Start`/);

  assert.match(
    commandLoop,
    /Session Start -> Discuss -> Plan -> Run -> Verify -> Ship -> Remember/
  );
  assert.match(commandLoop, /Map.*compatibility\/manual context-refresh command/i);
  assert.doesNotMatch(
    commandLoop,
    /Map -> Start -> Discuss -> Plan -> Run -> Verify -> Ship -> Remember/
  );

  assert.match(
    hostChecklist,
    /Session Start -> Discuss -> Plan -> Run -> Verify -> Ship -> Remember/
  );
  assert.match(hostChecklist, /Treat `Map` as a compatibility\/manual context-refresh command/);
});

test("adoption-facing install docs keep the Node CLI as primary", () => {
  const adoptionGuide = fs.readFileSync(path.join(repoRoot, "docs", "adoption-guide.md"), "utf8");
  const docsIndex = fs.readFileSync(path.join(repoRoot, "docs", "README.md"), "utf8");

  assert.match(
    adoptionGuide,
    /prefer the Node\.js CLI \(`npx ai-engineering-harness install` or `node bin\/aih\.js install`\) as the primary install surface/i
  );
  assert.match(adoptionGuide, /npx ai-engineering-harness install --target/);

  assert.match(
    docsIndex,
    /\*\*\[Runtime-Native Installation\]\(runtime-native-install\.md\)\*\* — Provider-specific install payloads and follow-up actions/
  );
});

test("active install docs keep npx as the primary lifecycle surface", () => {
  const commandModel = fs.readFileSync(
    path.join(repoRoot, "docs", "install-command-model.md"),
    "utf8"
  );
  const simpleCli = fs.readFileSync(path.join(repoRoot, "docs", "simple-cli-ux.md"), "utf8");
  const runtimeNative = fs.readFileSync(
    path.join(repoRoot, "docs", "runtime-native-install.md"),
    "utf8"
  );
  assert.match(commandModel, /Canonical scope: `npx ai-engineering-harness` lifecycle commands/);
  assert.match(commandModel, /`--provider <list>`/);
  assert.doesNotMatch(commandModel, /\| `--force` \|/);

  assert.match(simpleCli, /npx ai-engineering-harness install --provider cursor --yes/);

  assert.match(runtimeNative, /npx ai-engineering-harness install --provider <id>/);
  assert.match(runtimeNative, /Removed from the active install surface:/);
  assert.match(runtimeNative, /`opencode` — legacy cleanup only/);
  assert.doesNotMatch(runtimeNative, /^\| `opencode` \|/m);
  assert.doesNotMatch(runtimeNative, /^\| `windsurf` \|/m);
});

test("runtime adoption docs keep Node CLI primary", () => {
  const runtimeReadme = fs.readFileSync(path.join(repoRoot, "runtime", "README.md"), "utf8");
  const pluginInstallUx = fs.readFileSync(
    path.join(repoRoot, "docs", "plugin-install-ux.md"),
    "utf8"
  );
  const consumeAsPack = fs.readFileSync(path.join(repoRoot, "docs", "consume-as-pack.md"), "utf8");

  assert.match(runtimeReadme, /primary Node\.js CLI \(`npx ai-engineering-harness install`\)/);
  assert.doesNotMatch(runtimeReadme, /`\.opencode\/plugins\/.*`/);
  assert.doesNotMatch(runtimeReadme, /^\| `opencode\/plugins\/` \|/m);

  assert.match(pluginInstallUx, /Recommended consumer path \(current primary surface/);
  assert.match(pluginInstallUx, /npx ai-engineering-harness uninstall --provider cursor --yes/);
  assert.match(
    pluginInstallUx,
    /For primary day-to-day usage, prefer `npx ai-engineering-harness install`/
  );

  assert.match(
    consumeAsPack,
    /\*\*Consumers \(recommended\):\*\* install with the primary Node\.js CLI/
  );
  assert.match(
    consumeAsPack,
    /npx ai-engineering-harness install --provider generic --target \.\.\/my-project --yes/
  );
});

test("private install, uninstall, and harness-init docs keep the Node CLI as the primary operational surface", () => {
  const gitHygiene = fs.readFileSync(
    path.join(repoRoot, "docs", "private-install-git-hygiene.md"),
    "utf8"
  );
  const uninstallUsage = fs.readFileSync(path.join(repoRoot, "docs", "uninstall-usage.md"), "utf8");
  const harnessInit = fs.readFileSync(path.join(repoRoot, "docs", "harness-init-usage.md"), "utf8");

  assert.match(
    gitHygiene,
    /Primary surface: `npx ai-engineering-harness install --visibility private`/
  );
  assert.match(gitHygiene, /npx ai-engineering-harness install --provider cursor --scope project/);
  assert.doesNotMatch(gitHygiene, /\| cursor, windsurf \|/);
  assert.doesNotMatch(gitHygiene, /\| opencode \|/);

  assert.match(uninstallUsage, /Primary surface: `npx ai-engineering-harness uninstall`/);
  assert.match(uninstallUsage, /npx ai-engineering-harness uninstall --provider cursor --yes/);

  assert.match(harnessInit, /primary Node\.js CLI/);
  assert.match(
    harnessInit,
    /npx ai-engineering-harness install --provider claude --scope project --target \. --yes/
  );
  assert.match(
    harnessInit,
    /Primary Node CLI project installs initialize `\.harness\/` automatically when it is missing/
  );
});

test("cache, git-hygiene, and update docs keep Node CLI primary", () => {
  const capabilityCache = fs.readFileSync(
    path.join(repoRoot, "docs", "private-capability-cache.md"),
    "utf8"
  );
  const gitHygiene = fs.readFileSync(path.join(repoRoot, "docs", "git-hygiene-policy.md"), "utf8");
  const updateUsage = fs.readFileSync(path.join(repoRoot, "docs", "update-usage.md"), "utf8");

  assert.match(capabilityCache, /primary surface is `npx ai-engineering-harness install`/i);
  assert.match(capabilityCache, /`npx ai-engineering-harness update` refreshes `\.ai-harness\/`/);
  assert.doesNotMatch(capabilityCache, /^\| `opencode` \|/m);

  assert.match(
    gitHygiene,
    /primary Node CLI \(`npx ai-engineering-harness install --visibility private`\) writes `\.git\/info\/exclude`/i
  );
  assert.match(
    gitHygiene,
    /npx ai-engineering-harness install --provider cursor --scope project --visibility private --yes/
  );
  assert.doesNotMatch(gitHygiene, /cursor, windsurf/);
  assert.doesNotMatch(gitHygiene, /opencode\.json/);

  assert.match(updateUsage, /primary Node CLI does not support `--ref`/);
  assert.match(updateUsage, /npx ai-engineering-harness update --provider cursor --yes/);
  assert.doesNotMatch(updateUsage, /`opencode` →/);
});

test("project-state and runtime-aware validation docs reflect the current Node CLI install and validate flow", () => {
  const projectState = fs.readFileSync(
    path.join(repoRoot, "docs", "project-state-policy.md"),
    "utf8"
  );
  const runtimeValidation = fs.readFileSync(
    path.join(repoRoot, "docs", "runtime-aware-validation.md"),
    "utf8"
  );

  assert.match(projectState, /npx ai-engineering-harness install --target <repo>/);
  assert.match(projectState, /npx ai-engineering-harness install/);
  assert.match(projectState, /scaffolds minimal profile files under `<repo>\/\.harness\/`/);
  assert.match(
    projectState,
    /Runtime project config \(`\.claude\/settings\.json`, `\.cursor\/rules\/`, `\.gemini\/extensions\/…`\)/
  );
  assert.doesNotMatch(projectState, /ai-harness init --project/);
  assert.doesNotMatch(projectState, /opencode\.json/);

  assert.match(
    runtimeValidation,
    /OpenCode is historical\/legacy only and is not a current validation mode/
  );
  assert.match(
    runtimeValidation,
    /npx ai-engineering-harness install --provider cursor --scope project --target \. --yes/
  );
  assert.match(
    runtimeValidation,
    /Use the same runtime names as the primary Node CLI install surface/
  );
  assert.doesNotMatch(runtimeValidation, /`opencode` removed v0\.11\.0/);
});

test("provider matrix and runtime compatibility docs keep active install surfaces on the Node CLI", () => {
  const providerMatrix = fs.readFileSync(
    path.join(repoRoot, "docs", "provider-command-matrix.md"),
    "utf8"
  );
  const providerResearch = fs.readFileSync(
    path.join(repoRoot, "docs", "provider-native-command-research.md"),
    "utf8"
  );

  assert.match(providerMatrix, /Active scope \(v1.x\): Claude, Cursor, Codex, Gemini/);
  assert.match(providerMatrix, /npx ai-engineering-harness install --provider cursor/);
  assert.doesNotMatch(providerMatrix, /npx project install/);

  assert.match(providerResearch, /npx ai-engineering-harness install --provider codex/);
  assert.doesNotMatch(providerResearch, /npx install --provider codex/);
});

test("runtime dogfood summary keeps Windsurf and OpenCode in historical scope", () => {
  const runtimeDogfood = fs.readFileSync(
    path.join(repoRoot, "docs", "runtime-dogfood-summary.md"),
    "utf8"
  );

  assert.match(runtimeDogfood, /historical alias of `cursor` in older installer flows/);
  assert.doesNotMatch(runtimeDogfood, /Windsurf: alias of `cursor` in installer/);
  assert.match(runtimeDogfood, /\| D4 \| opencode \| project \| PASS \| PASS \|/);
  assert.match(
    runtimeDogfood,
    /\*\*Windsurf:\*\* historical alias of `cursor` in older installer flows; not separately dogfooded\./
  );
});

test("runtime-native install docs keep legacy OpenCode cleanup routed through uninstall usage", () => {
  const runtimeNative = fs.readFileSync(
    path.join(repoRoot, "docs", "runtime-native-install.md"),
    "utf8"
  );

  assert.match(
    runtimeNative,
    /legacy cleanup only; see \[uninstall-usage\.md\]\(uninstall-usage\.md\)/
  );
});

test("install and diagnostics warnings point legacy residue cleanup to uninstall docs", () => {
  const installCommand = fs.readFileSync(
    path.join(repoRoot, "lib", "cli-commands", "install.ts"),
    "utf8"
  );
  const diagnosticsCommand = fs.readFileSync(
    path.join(repoRoot, "lib", "cli-commands", "diagnostics.ts"),
    "utf8"
  );

  assert.match(
    installCommand,
    /See docs\/uninstall-usage\.md for legacy cleanup guidance if this is stale\./
  );
  assert.match(
    diagnosticsCommand,
    /See docs\/uninstall-usage\.md for legacy cleanup guidance if needed\./
  );
});

test("private capability cache docs route legacy OpenCode cleanup through uninstall usage", () => {
  const privateCache = fs.readFileSync(
    path.join(repoRoot, "docs", "private-capability-cache.md"),
    "utf8"
  );

  assert.match(
    privateCache,
    /see \[uninstall-usage\.md\]\(uninstall-usage\.md\) for cleanup guidance/i
  );
});

test("runtime command surface docs name the full package install command in activation examples", () => {
  const runtimeCommandSurface = fs.readFileSync(
    path.join(repoRoot, "docs", "runtime-command-surface.md"),
    "utf8"
  );

  assert.match(
    runtimeCommandSurface,
    /Project-local activation \(npx ai-engineering-harness install\)/
  );
  assert.match(
    runtimeCommandSurface,
    /Cursor \| `npx ai-engineering-harness install` \+ project commands\/rules/
  );
  assert.match(
    runtimeCommandSurface,
    /Claude \| `\/plugin install …` \| `npx ai-engineering-harness install` \+ `\.claude\/commands\/`/
  );
  assert.doesNotMatch(runtimeCommandSurface, /Project-local activation \(npx install\)/);
  assert.doesNotMatch(runtimeCommandSurface, /\| Cursor \| npx \+ project commands\/rules \|/);
  assert.doesNotMatch(
    runtimeCommandSurface,
    /\| Claude \| `\/plugin install …` \| npx \+ `\.claude\/commands\/` \|/
  );
});
