const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const childProcess = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const version = pkg.version;

test("release-facing files read version from package.json", () => {
  const lock = JSON.parse(fs.readFileSync(path.join(repoRoot, "package-lock.json"), "utf8"));
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  const docsIndex = fs.readFileSync(path.join(repoRoot, "docs", "README.md"), "utf8");
  const notesPath = path.join(repoRoot, "docs", `v${version}-release-notes.md`);

  assert.equal(lock.version, version);
  assert.equal(lock.packages[""].version, version);
  assert.match(readme, new RegExp(`v${version.replace(/\./g, "\\.")}`));
  assert.match(docsIndex, new RegExp(version.replace(/\./g, "\\.")));
  assert.ok(fs.existsSync(notesPath), `docs/v${version}-release-notes.md must exist`);

  const notes = fs.readFileSync(notesPath, "utf8");
  assert.match(notes, new RegExp(`# v${version.replace(/\./g, "\\.")}`));
});

test("sync-site-version script exists", () => {
  assert.ok(fs.existsSync(path.join(repoRoot, "scripts", "sync-site-version.js")));
});

test("sync-site-version updates release-facing markdown from package.json", () => {
  const tempRepo = fs.mkdtempSync(path.join(os.tmpdir(), "aih-version-sync-"));
  fs.cpSync(repoRoot, tempRepo, {
    recursive: true,
    filter(source) {
      const relative = path.relative(repoRoot, source);
      if (!relative) {
        return true;
      }
      const topLevel = relative.split(path.sep)[0];
      return ![".git", "node_modules", "artifacts"].includes(topLevel);
    },
  });

  const nextVersion = "1.2.3";
  const packageJsonPath = path.join(tempRepo, "package.json");
  const tempPkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  tempPkg.version = nextVersion;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(tempPkg, null, 2)}\n`);

  const result = childProcess.spawnSync(
    process.execPath,
    [path.join(tempRepo, "scripts", "sync-site-version.js"), "--repo-root", tempRepo],
    { encoding: "utf8" }
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const readme = fs.readFileSync(path.join(tempRepo, "README.md"), "utf8");
  const docsIndex = fs.readFileSync(path.join(tempRepo, "docs", "README.md"), "utf8");
  assert.match(readme, /badge\/version-v1\.2\.3-/);
  assert.match(readme, /docs\/v1\.2\.3-release-notes\.md/);
  assert.match(readme, /\*\*v1\.2\.3\*\*:/);
  assert.match(
    docsIndex,
    /\| \*\*v1\.2\.3\*\* \| \[Release Notes\]\(v1\.2\.3-release-notes\.md\) \|/
  );
});

test("site version surfaces read from injected harness version constant", () => {
  const hero = fs.readFileSync(
    path.join(repoRoot, "site", "src", "components", "Hero.tsx"),
    "utf8"
  );
  const footer = fs.readFileSync(
    path.join(repoRoot, "site", "src", "components", "Footer.tsx"),
    "utf8"
  );
  const providerCards = fs.readFileSync(
    path.join(repoRoot, "site", "src", "components", "ProviderCards.tsx"),
    "utf8"
  );
  const viteConfig = fs.readFileSync(path.join(repoRoot, "site", "vite.config.ts"), "utf8");

  for (const content of [hero, footer, providerCards]) {
    assert.doesNotMatch(content, new RegExp(`v?${version.replace(/\./g, "\\.")}`));
    assert.match(content, /__HARNESS_VERSION__/);
  }
  assert.match(viteConfig, /package\.json/);
  assert.match(viteConfig, /__HARNESS_VERSION__/);
});

test("versioning and release policy docs reflect the current v1.x stability posture", () => {
  const versioning = fs.readFileSync(path.join(repoRoot, "docs", "versioning.md"), "utf8");
  const breakingPolicy = fs.readFileSync(
    path.join(repoRoot, "docs", "breaking-change-policy.md"),
    "utf8"
  );
  const notes = fs.readFileSync(
    path.join(repoRoot, "docs", `v${version}-release-notes.md`),
    "utf8"
  );

  assert.match(versioning, /## Current Meaning Of `v1\.x`/);
  assert.match(versioning, /`v1\.0\.0` is the first stable capability pack release/i);
  assert.doesNotMatch(versioning, /`v1\.0\.0` should be the first stable capability pack release/i);

  assert.match(breakingPolicy, /after `v1\.0\.0`|post-v1/i);
  assert.match(breakingPolicy, /major version/i);

  assert.doesNotMatch(
    notes,
    /walkthrough video integration|repo-local MP4|embedded directly on the landing page/i
  );
  assert.doesNotMatch(
    notes,
    /Session Start → Map → Discuss → Plan → Run → Verify → Ship → Remember/
  );
  assert.match(notes, /Session Start → Discuss → Plan → Run → Verify → Ship → Remember/);
});
